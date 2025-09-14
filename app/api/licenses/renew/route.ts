import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getClientIP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseId, newEndTime, reason } = body

    if (!licenseId || !newEndTime) {
      return NextResponse.json(
        { error: '授权ID和新结束时间不能为空' },
        { status: 400 }
      )
    }

    // 验证新时间
    if (new Date(newEndTime) <= new Date()) {
      return NextResponse.json(
        { error: '新结束时间必须晚于当前时间' },
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

    if (license.status !== 'active') {
      return NextResponse.json(
        { error: '只能续期活跃状态的授权' },
        { status: 400 }
      )
    }

    // 更新授权时间
    const { error: updateError } = await supabase
      .from('licenses')
      .update({ 
        end_time: newEndTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', licenseId)

    if (updateError) {
      console.error('续期授权失败:', updateError)
      return NextResponse.json(
        { error: '续期授权失败' },
        { status: 500 }
      )
    }

    // 记录日志
    const clientIP = getClientIP(request)
    await supabase
      .from('license_logs')
      .insert({
        license_id: licenseId,
        action: 'renew',
        result: 'success',
        detail: `续期授权至: ${newEndTime}, 原因: ${reason || '管理员操作'}`,
        operator: 'admin',
        ip: clientIP
      })

    return NextResponse.json({
      success: true,
      message: '授权续期成功'
    })

  } catch (error) {
    console.error('续期授权异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

