/**
 * 授权客户端 SDK
 * 用于客户端软件集成授权验证功能
 */

class LicenseClient {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || 'https://your-domain.vercel.app/api'
    this.licenseKey = options.licenseKey || null
    this.deviceId = options.deviceId || null
    this.token = null
    this.tokenExpiry = null
    this.refreshInterval = null
    this.onTokenExpired = options.onTokenExpired || (() => {})
    this.onValidationFailed = options.onValidationFailed || (() => {})
  }

  /**
   * 生成设备指纹
   */
  generateDeviceId() {
    // 简单的设备指纹生成（实际应用中可以使用更复杂的算法）
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    // 简单的哈希函数
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    return Math.abs(hash).toString(16)
  }

  /**
   * 验证授权码
   */
  async validateLicense(licenseKey) {
    try {
      this.licenseKey = licenseKey
      this.deviceId = this.deviceId || this.generateDeviceId()

      const response = await fetch(`${this.apiUrl}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey: this.licenseKey,
          deviceId: this.deviceId,
          deviceInfo: {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        this.token = data.data.token
        this.tokenExpiry = new Date(Date.now() + 12 * 60 * 60 * 1000) // 12小时后过期
        
        // 启动自动刷新
        this.startTokenRefresh()
        
        return {
          success: true,
          license: data.data.license,
          deviceId: data.data.device_id
        }
      } else {
        this.onValidationFailed(data.error)
        return {
          success: false,
          error: data.error
        }
      }
    } catch (error) {
      console.error('授权验证失败:', error)
      this.onValidationFailed('网络错误')
      return {
        success: false,
        error: '网络错误'
      }
    }
  }

  /**
   * 检查当前授权状态
   */
  isAuthorized() {
    if (!this.token || !this.tokenExpiry) {
      return false
    }
    
    return new Date() < this.tokenExpiry
  }

  /**
   * 获取当前授权信息
   */
  getLicenseInfo() {
    if (!this.isAuthorized()) {
      return null
    }
    
    return {
      licenseKey: this.licenseKey,
      deviceId: this.deviceId,
      token: this.token,
      expiresAt: this.tokenExpiry
    }
  }

  /**
   * 启动token自动刷新
   */
  startTokenRefresh() {
    // 清除之前的定时器
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    // 每6小时刷新一次token
    this.refreshInterval = setInterval(() => {
      this.refreshToken()
    }, 6 * 60 * 60 * 1000)
  }

  /**
   * 刷新token
   */
  async refreshToken() {
    if (!this.licenseKey || !this.deviceId) {
      return false
    }

    try {
      const result = await this.validateLicense(this.licenseKey)
      return result.success
    } catch (error) {
      console.error('Token刷新失败:', error)
      this.onTokenExpired()
      return false
    }
  }

  /**
   * 停止自动刷新
   */
  stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  /**
   * 销毁客户端
   */
  destroy() {
    this.stopTokenRefresh()
    this.token = null
    this.tokenExpiry = null
    this.licenseKey = null
    this.deviceId = null
  }
}

// 导出SDK
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LicenseClient
} else if (typeof window !== 'undefined') {
  window.LicenseClient = LicenseClient
}

