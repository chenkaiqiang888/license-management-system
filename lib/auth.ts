import { NextRequest } from 'next/server'
import { verifyToken } from './jwt'

export function verifyAdminAuth(request: NextRequest): boolean {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return false
    }

    const payload = verifyToken(token)
    return payload !== null && payload.licenseId === 'admin'
  } catch (error) {
    return false
  }
}

export function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
  }
}
