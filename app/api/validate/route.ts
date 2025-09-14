import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateToken, verifyToken } from '@/lib/jwt'
import { getClientIP, generateDeviceId, validateLicenseKey, isLicenseExpired } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, deviceId, deviceInfo } = body

    if (!licenseKey) {
      return NextResponse.json(
        { error: '授权码不能为空' },
        { status: 400 }
      )
    }

    // 验证授权码格式
    if (!validateLicenseKey(licenseKey)) {
      return NextResponse.json(
        { error: '授权码格式不正确' },
        { status: 400 }
      )
    }

    // 生成设备ID（如果未提供）
    const finalDeviceId = deviceId || generateDeviceId(
      request.headers.get('user-agent') || '',
      request.headers.get('accept-language') || ''
    )

    const clientIP = getClientIP(request)

    // 查询授权信息
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', licenseKey)
      .single()

    if (licenseError || !license) {
      // 记录失败日志
      await supabase
        .from('license_logs')
        .insert({
          license_id: null,
          action: 'validate',
          result: 'fail',
          detail: `授权码不存在: ${licenseKey}`,
          operator: 'client',
          ip: clientIP
        })

      return NextResponse.json(
        { error: '授权码不存在' },
        { status: 404 }
      )
    }

    // 检查授权状态
    if (license.status !== 'active') {
      await supabase
        .from('license_logs')
        .insert({
          license_id: license.id,
          action: 'validate',
          result: 'fail',
          detail: `授权状态异常: ${license.status}`,
          operator: 'client',
          ip: clientIP
        })

      return NextResponse.json(
        { error: '授权已被撤销或过期' },
        { status: 403 }
      )
    }

    // 检查是否过期
    if (isLicenseExpired(license.end_time)) {
      // 更新授权状态为过期
      await supabase
        .from('licenses')
        .update({ 
          status: 'expired',
          updated_at: new Date().toISOString()
        })
        .eq('id', license.id)

      await supabase
        .from('license_logs')
        .insert({
          license_id: license.id,
          action: 'expire',
          result: 'success',
          detail: '授权已过期',
          operator: 'system',
          ip: clientIP
        })

      return NextResponse.json(
        { error: '授权已过期' },
        { status: 403 }
      )
    }

    // 检查设备激活情况
    const { data: existingActivation } = await supabase
      .from('activations')
      .select('*')
      .eq('license_id', license.id)
      .eq('device_id', finalDeviceId)
      .is('unbound_at', null)
      .single()

    // 如果设备未激活，检查激活数量限制
    if (!existingActivation) {
      const { data: activeActivations, error: countError } = await supabase
        .from('activations')
        .select('id', { count: 'exact' })
        .eq('license_id', license.id)
        .is('unbound_at', null)

      if (countError) {
        console.error('查询激活数量失败:', countError)
        return NextResponse.json(
          { error: '验证失败' },
          { status: 500 }
        )
      }

      const currentActivations = activeActivations?.length || 0
      if (currentActivations >= license.max_activations) {
        await supabase
          .from('license_logs')
          .insert({
            license_id: license.id,
            action: 'validate',
            result: 'fail',
            detail: `激活数量已达上限: ${currentActivations}/${license.max_activations}`,
            operator: 'client',
            ip: clientIP
          })

        return NextResponse.json(
          { error: '激活数量已达上限' },
          { status: 403 }
        )
      }

      // 激活设备
      const { error: activationError } = await supabase
        .from('activations')
        .insert({
          license_id: license.id,
          device_id: finalDeviceId,
          device_info: deviceInfo || null
        })

      if (activationError) {
        console.error('激活设备失败:', activationError)
        return NextResponse.json(
          { error: '激活失败' },
          { status: 500 }
        )
      }

      // 记录激活日志
      await supabase
        .from('license_logs')
        .insert({
          license_id: license.id,
          action: 'activate',
          result: 'success',
          detail: `设备激活: ${finalDeviceId}`,
          operator: 'client',
          ip: clientIP
        })
    }

    // 生成授权token
    const token = generateToken(license.id, finalDeviceId, '12h')

    // 记录验证成功日志
    await supabase
      .from('license_logs')
      .insert({
        license_id: license.id,
        action: 'validate',
        result: 'success',
        detail: '授权验证成功',
        operator: 'client',
        ip: clientIP
      })

    return NextResponse.json({
      success: true,
      data: {
        token,
        license: {
          id: license.id,
          license_key: license.license_key,
          end_time: license.end_time,
          max_activations: license.max_activations
        },
        device_id: finalDeviceId
      }
    })

  } catch (error) {
    console.error('授权验证异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

