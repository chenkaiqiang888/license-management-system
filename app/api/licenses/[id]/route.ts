import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const licenseId = params.id

    if (!licenseId) {
      return NextResponse.json(
        { error: '授权ID不能为空' },
        { status: 400 }
      )
    }

    // 查询授权详情
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select(`
        *,
        products (
          id,
          name,
          description
        )
      `)
      .eq('id', licenseId)
      .single()

    if (licenseError || !license) {
      return NextResponse.json(
        { error: '授权不存在' },
        { status: 404 }
      )
    }

    // 查询激活记录
    const { data: activations, error: activationsError } = await supabase
      .from('activations')
      .select('*')
      .eq('license_id', licenseId)
      .order('activated_at', { ascending: false })

    if (activationsError) {
      console.error('查询激活记录失败:', activationsError)
    }

    // 查询最近日志
    const { data: logs, error: logsError } = await supabase
      .from('license_logs')
      .select('*')
      .eq('license_id', licenseId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.error('查询日志失败:', logsError)
    }

    return NextResponse.json({
      success: true,
      data: {
        license,
        activations: activations || [],
        logs: logs || []
      }
    })

  } catch (error) {
    console.error('查询授权详情异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

