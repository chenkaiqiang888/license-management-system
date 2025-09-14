import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseId, deviceId, reason } = body

    if (!licenseId || !deviceId) {
      return NextResponse.json(
        { error: '授权ID和设备ID不能为空' },
        { status: 400 }
      )
    }

    // 检查激活记录是否存在
    const { data: activation, error: fetchError } = await supabase
      .from('activations')
      .select('*')
      .eq('license_id', licenseId)
      .eq('device_id', deviceId)
      .is('unbound_at', null)
      .single()

    if (fetchError || !activation) {
      return NextResponse.json(
        { error: '激活记录不存在或已解绑' },
        { status: 404 }
      )
    }

    // 解绑设备
    const { error: updateError } = await supabase
      .from('activations')
      .update({ 
        unbound_at: new Date().toISOString()
      })
      .eq('id', activation.id)

    if (updateError) {
      console.error('解绑设备失败:', updateError)
      return NextResponse.json(
        { error: '解绑设备失败' },
        { status: 500 }
      )
    }

    // 记录日志
    const clientIP = getClientIP(request)
    await supabase
      .from('license_logs')
      .insert({
        license_id: licenseId,
        action: 'unbind',
        result: 'success',
        detail: `解绑设备: ${deviceId}, 原因: ${reason || '管理员操作'}`,
        operator: 'admin',
        ip: clientIP
      })

    return NextResponse.json({
      success: true,
      message: '设备解绑成功'
    })

  } catch (error) {
    console.error('解绑设备异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

