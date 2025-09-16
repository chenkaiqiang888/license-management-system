'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface Activation {
  id: string
  license_id: string
  device_id: string
  device_info?: string
  activated_at: string
  unbound_at?: string
  licenses?: {
    license_key: string
  }
}

export default function ActivationsPage() {
  const [activations, setActivations] = useState<Activation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [licenseFilter, setLicenseFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchActivations()
  }, [currentPage, licenseFilter, statusFilter])

  const fetchActivations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })
      
      if (licenseFilter) {
        params.append('license_id', licenseFilter)
      }
      
      if (statusFilter) {
        params.append('status', statusFilter)
      }

      const response = await fetch(`/api/activations?${params}`)
      const data = await response.json()

      if (data.success) {
        setActivations(data.data.activations)
        setTotalPages(data.data.pagination.pages)
      }
    } catch (error) {
      console.error('获取激活记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUnbind = async (licenseId: string, deviceId: string) => {
    if (!confirm('确定要解绑此设备吗？')) return

    try {
      const response = await fetch('/api/activations/unbind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_id: licenseId,
          device_id: deviceId
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('解绑成功')
        fetchActivations()
      } else {
        alert('解绑失败: ' + data.error)
      }
    } catch (error) {
      console.error('解绑失败:', error)
      alert('解绑失败')
    }
  }

  const getStatusBadge = (activation: Activation) => {
    if (activation.unbound_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-500/20 text-red-300 border-red-500/30">
          <span className="mr-1">✕</span>
          已解绑
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-500/20 text-green-300 border-green-500/30">
        <span className="mr-1">✓</span>
        活跃
      </span>
    )
  }

  return (
    <AdminLayout title="激活记录" subtitle="查看设备激活和解绑记录">
      <div className="space-y-6">
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
                  placeholder="搜索授权ID..."
                  value={licenseFilter}
                  onChange={(e) => setLicenseFilter(e.target.value)}
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
                <option value="unbound" className="bg-gray-800 text-white">已解绑</option>
              </select>
            </div>
          </div>
        </div>

        {/* 激活记录列表 */}
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
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">设备ID</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">授权码</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">设备信息</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">激活时间</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">解绑时间</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {activations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-white/70">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-white/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium mb-2">暂无激活记录</p>
                            <p className="text-sm">当有设备激活授权时，记录将显示在这里</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      activations.map((activation) => (
                        <tr key={activation.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm text-white">
                              {activation.device_id}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-mono text-sm text-white">
                              {activation.licenses?.license_key || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/90 max-w-xs truncate">
                              {activation.device_info || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/90">
                              {new Date(activation.activated_at).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white/90">
                              {activation.unbound_at 
                                ? new Date(activation.unbound_at).toLocaleString()
                                : '-'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(activation)}
                          </td>
                          <td className="px-6 py-4">
                            {!activation.unbound_at && (
                              <button
                                onClick={() => handleUnbind(activation.license_id, activation.device_id)}
                                className="text-red-300 hover:text-red-200 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-500/20 transition-colors"
                              >
                                解绑
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
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
    </AdminLayout>
  )
}