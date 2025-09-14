import { NextRequest } from 'next/server'

// 获取客户端 IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// 生成设备指纹
export function generateDeviceId(userAgent: string, acceptLanguage?: string): string {
  const crypto = require('crypto')
  const data = `${userAgent}-${acceptLanguage || ''}-${Date.now()}`
  return crypto.createHash('md5').update(data).digest('hex')
}

// 验证授权码格式
export function validateLicenseKey(licenseKey: string): boolean {
  return /^[A-Z0-9]{16}$/.test(licenseKey)
}

// 检查授权是否过期
export function isLicenseExpired(endTime: string): boolean {
  return new Date(endTime) < new Date()
}

// 格式化日期
export function formatDate(date: string | Date): string {
  return new Date(date).toISOString()
}

