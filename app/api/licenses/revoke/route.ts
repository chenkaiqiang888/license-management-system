import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseId, reason } = body

    if (!licenseId) {
      return NextResponse.json(
        { error: '授权ID不能为空' },
        { status: 400 }
      )
    }

    // 检查授权是否存在
    const { data: license, error: fetchError } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', licenseId)
      .single()

    if (fetchError || !license) {
      return NextResponse.json(
        { error: '授权不存在' },
        { status: 404 }
      )
    }

    if (license.status === 'revoked') {
      return NextResponse.json(
        { error: '授权已被撤销' },
        { status: 400 }
      )
    }

    // 撤销授权
    const { error: updateError } = await supabase
      .from('licenses')
      .update({ 
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('id', licenseId)

    if (updateError) {
      console.error('撤销授权失败:', updateError)
      return NextResponse.json(
        { error: '撤销授权失败' },
        { status: 500 }
      )
    }

    // 解绑所有设备
    await supabase
      .from('activations')
      .update({ unbound_at: new Date().toISOString() })
      .eq('license_id', licenseId)
      .is('unbound_at', null)

    // 记录日志
    const clientIP = getClientIP(request)
    await supabase
      .from('license_logs')
      .insert({
        license_id: licenseId,
        action: 'revoke',
        result: 'success',
        detail: `撤销授权: ${reason || '管理员操作'}`,
        operator: 'admin',
        ip: clientIP
      })

    return NextResponse.json({
      success: true,
      message: '授权已撤销'
    })

  } catch (error) {
    console.error('撤销授权异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

