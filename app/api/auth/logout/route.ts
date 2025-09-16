import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: '登出成功'
    })

    // 清除cookie
    response.cookies.set('admin_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0 // 立即过期
    })

    return response

  } catch (error) {
    console.error('登出异常:', error)
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    )
  }
}
