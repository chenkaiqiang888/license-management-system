import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const productId = searchParams.get('product_id')

    // 构建查询条件
    let query = supabase
      .from('licenses')
      .select(`
        *,
        products (
          id,
          name
        )
      `, { count: 'exact' })

    // 状态过滤
    if (status) {
      query = query.eq('status', status)
    }

    // 产品过滤
    if (productId) {
      query = query.eq('product_id', productId)
    }

    // 搜索过滤
    if (search) {
      query = query.or(`license_key.ilike.%${search}%,note.ilike.%${search}%`)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: licenses, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      console.error('查询授权列表失败:', error)
      return NextResponse.json(
        { error: '查询失败' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        licenses: licenses || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit)
        }
      }
    })

  } catch (error) {
    console.error('查询授权列表异常:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

