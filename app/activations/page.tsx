'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'

interface Activation {
  id: string
  license_id: string
  device_id: string
  device_info?: string
  activated_at: string
  unbound_at?: string
  licenses?: {
    id: string
    license_key: string
    status: string
    end_time: string
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
      
      if (licenseFilter) params.append('license_id', licenseFilter)
      if (statusFilter) params.append('status', statusFilter)

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          licenseId,
          deviceId,
          reason: '管理员解绑'
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('设备解绑成功')
        fetchActivations()
      } else {
        alert(data.error || '解绑失败')
      }
    } catch (error) {
      console.error('解绑设备失败:', error)
      alert('解绑失败')
    }
  }

  const getStatusBadge = (activation: Activation) => {
    if (activation.unbound_at) {
      return <span className="status-badge status-revoked">已解绑</span>
    }
    return <span className="status-badge status-active">活跃</span>
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">激活记录</h1>

          {/* 搜索和过滤 */}
          <div className="mb-6 flex gap-4">
            <input
              type="text"
              placeholder="搜索授权ID..."
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              className="input flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-40"
            >
              <option value="">全部状态</option>
              <option value="active">活跃</option>
              <option value="unbound">已解绑</option>
            </select>
          </div>

          {/* 激活记录列表 */}
          <div className="card">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>设备ID</th>
                      <th>授权码</th>
                      <th>设备信息</th>
                      <th>激活时间</th>
                      <th>解绑时间</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activations.map((activation) => (
                      <tr key={activation.id}>
                        <td className="font-mono text-sm">{activation.device_id}</td>
                        <td className="font-mono text-sm">
                          {activation.licenses?.license_key || '-'}
                        </td>
                        <td className="max-w-xs truncate">
                          {activation.device_info || '-'}
                        </td>
                        <td>{new Date(activation.activated_at).toLocaleString()}</td>
                        <td>
                          {activation.unbound_at 
                            ? new Date(activation.unbound_at).toLocaleString()
                            : '-'
                          }
                        </td>
                        <td>{getStatusBadge(activation)}</td>
                        <td>
                          {!activation.unbound_at && (
                            <button
                              onClick={() => handleUnbind(activation.license_id, activation.device_id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              解绑
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

