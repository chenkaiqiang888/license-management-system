import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const licenseId = searchParams.get('license_id')
    const status = searchParams.get('status')

    // 构建查询条件
    let query = supabase
      .from('activations')
      .select(`
        *,
        licenses (
          id,
          license_key,
          status,
          end_time
        )
      `, { count: 'exact' })

    // 授权ID过滤
    if (licenseId) {
      query = query.eq('license_id', licenseId)
    }

    // 状态过滤
    if (status === 'active') {
      query = query.is('unbound_at', null)
    } else if (status === 'unbound') {
      query = query.not('unbound_at', 'is', null)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: activations, error, count } = await query
      .order('activated_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('查询激活记录失败:', error)
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        activations: activations || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('查询激活记录异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

