import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)

    if (!payload || payload.licenseId !== 'admin') {
      return NextResponse.json(
        { error: '无效的认证信息' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '认证成功'
    })

  } catch (error) {
    console.error('认证验证异常:', error)
    return NextResponse.json(
      { error: '认证失败' },
      { status: 401 }
    )
  }
}
