import jwt, { SignOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-2024'

export interface JWTPayload {
  licenseId: string
  deviceId: string
  exp: number
  iat: number
}

// 生成授权 token
export function generateToken(licenseId: string, deviceId: string, expiresIn: string = '12h'): string {
  return jwt.sign(
    { licenseId, deviceId },
    JWT_SECRET,
    { expiresIn: expiresIn as any }
  )
}

// 验证 token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

// 生成授权码
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
