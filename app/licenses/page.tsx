'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'
import CreateLicenseModal from '@/components/CreateLicenseModal'

interface License {
  id: string
  license_key: string
  product_id?: string
  start_time: string
  end_time: string
  status: 'active' | 'revoked' | 'expired'
  max_activations: number
  created_at: string
  note?: string
  products?: {
    id: string
    name: string
  }
}

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    revoked: 0,
    expired: 0
  })

  useEffect(() => {
    fetchLicenses()
  }, [currentPage, searchTerm, statusFilter])

  const fetchLicenses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/licenses?${params}`)
      const data = await response.json()

      if (data.success) {
        setLicenses(data.data.licenses)
        setTotalPages(data.data.pagination.pages)
        
        // 计算统计信息
        const allLicenses = data.data.licenses
        setStats({
          total: allLicenses.length,
          active: allLicenses.filter((l: License) => l.status === 'active').length,
          revoked: allLicenses.filter((l: License) => l.status === 'revoked').length,
          expired: allLicenses.filter((l: License) => l.status === 'expired').length
        })
      }
    } catch (error) {
      console.error('获取授权列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = async (licenseId: string) => {
    if (!confirm('确定要撤销此授权吗？')) return

    try {
      const response = await fetch('/api/licenses/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          licenseId,
          reason: '管理员撤销'
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('授权已撤销')
        fetchLicenses()
      } else {
        alert(data.error || '撤销失败')
      }
    } catch (error) {
      console.error('撤销授权失败:', error)
      alert('撤销失败')
    }
  }

  const handleRenew = async (licenseId: string) => {
    const newEndTime = prompt('请输入新的结束时间 (YYYY-MM-DD):')
    if (!newEndTime) return

    try {
      const response = await fetch('/api/licenses/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          licenseId,
          newEndTime: new Date(newEndTime).toISOString(),
          reason: '管理员续期'
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('授权续期成功')
        fetchLicenses()
      } else {
        alert(data.error || '续期失败')
      }
    } catch (error) {
      console.error('续期授权失败:', error)
      alert('续期失败')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        class: 'bg-green-500/20 text-green-300 border-green-500/30', 
        icon: '✓',
        text: '活跃'
      },
      revoked: { 
        class: 'bg-red-500/20 text-red-300 border-red-500/30', 
        icon: '✕',
        text: '已撤销'
      },
      expired: { 
        class: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', 
        icon: '⏰',
        text: '已过期'
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.class}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const getDaysRemaining = (endTime: string) => {
    const now = new Date()
    const end = new Date(endTime)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <AdminLayout title="授权管理" subtitle="管理软件授权码，监控使用状态">
      <div className="space-y-6">
        {/* 操作按钮 */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            创建授权
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
                <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">总授权数</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/20 rounded-lg mr-4">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">活跃授权</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-500/20 rounded-lg mr-4">
                <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">已撤销</p>
                <p className="text-2xl font-bold text-white">{stats.revoked}</p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/20 rounded-lg mr-4">
                <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">已过期</p>
                <p className="text-2xl font-bold text-white">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和过滤区域 */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="搜索授权码或备注..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200"
              >
                <option value="" className="bg-gray-800 text-white">全部状态</option>
                <option value="active" className="bg-gray-800 text-white">活跃</option>
                <option value="revoked" className="bg-gray-800 text-white">已撤销</option>
                <option value="expired" className="bg-gray-800 text-white">已过期</option>
              </select>
            </div>
          </div>
        </div>

        {/* 授权列表 */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/20 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">授权码</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">产品</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">有效期</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">激活数</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">备注</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {licenses.map((license) => {
                      const daysRemaining = getDaysRemaining(license.end_time)
                      return (
                        <tr key={license.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="font-mono text-sm font-medium text-white">
                                {license.license_key}
                              </div>
                              <button className="ml-2 text-white/50 hover:text-white/80">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/90">
                              {license.products?.name || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/90">
                              <div>{new Date(license.start_time).toLocaleDateString()}</div>
                              <div className="text-white/60">至 {new Date(license.end_time).toLocaleDateString()}</div>
                              {license.status === 'active' && daysRemaining > 0 && (
                                <div className={`text-xs mt-1 ${daysRemaining <= 7 ? 'text-red-300' : daysRemaining <= 30 ? 'text-yellow-300' : 'text-green-300'}`}>
                                  剩余 {daysRemaining} 天
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(license.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/90">
                              {license.max_activations}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/90 max-w-xs truncate">
                              {license.note || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {license.status === 'active' && (
                                <>
                                  <button
                                    onClick={() => handleRenew(license.id)}
                                    className="text-blue-300 hover:text-blue-200 text-sm font-medium px-3 py-1 rounded-md hover:bg-blue-500/20 transition-colors"
                                  >
                                    续期
                                  </button>
                                  <button
                                    onClick={() => handleRevoke(license.id)}
                                    className="text-red-300 hover:text-red-200 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-500/20 transition-colors"
                                  >
                                    撤销
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="bg-white/5 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-white/70">
                    第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/20 rounded-md hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateLicenseModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchLicenses()
          }}
        />
      )}
    </AdminLayout>
  )
}
