import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const licenseId = searchParams.get('license_id')
    const action = searchParams.get('action')
    const result = searchParams.get('result')
    const operator = searchParams.get('operator')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // 构建查询条件
    let query = supabase
      .from('license_logs')
      .select(`
        *,
        licenses (
          id,
          license_key
        )
      `, { count: 'exact' })

    // 授权ID过滤
    if (licenseId) {
      query = query.eq('license_id', licenseId)
    }

    // 操作类型过滤
    if (action) {
      query = query.eq('action', action)
    }

    // 结果过滤
    if (result) {
      query = query.eq('result', result)
    }

    // 操作者过滤
    if (operator) {
      query = query.eq('operator', operator)
    }

    // 时间范围过滤
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: logs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('查询日志失败:', error)
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        logs: logs || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('查询日志异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

