'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'

interface Log {
  id: string
  license_id: string
  action: string
  result: 'success' | 'fail'
  detail?: string
  operator?: string
  ip?: string
  created_at: string
  licenses?: {
    id: string
    license_key: string
  }
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    licenseId: '',
    action: '',
    result: '',
    operator: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchLogs()
  }, [currentPage, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
      })
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/logs?${params}`)
      const data = await response.json()

      if (data.success) {
        setLogs(data.data.logs)
        setTotalPages(data.data.pagination.pages)
      }
    } catch (error) {
      console.error('获取日志失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // 重置到第一页
  }

  const getResultBadge = (result: string) => {
    return (
      <span className={`status-badge ${
        result === 'success' ? 'status-active' : 'status-revoked'
      }`}>
        {result}
      </span>
    )
  }

  const getActionBadge = (action: string) => {
    const colors = {
      validate: 'bg-blue-100 text-blue-800',
      activate: 'bg-green-100 text-green-800',
      revoke: 'bg-red-100 text-red-800',
      expire: 'bg-yellow-100 text-yellow-800',
      unbind: 'bg-orange-100 text-orange-800',
      create: 'bg-purple-100 text-purple-800',
      renew: 'bg-indigo-100 text-indigo-800'
    }
    
    return (
      <span className={`status-badge ${colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {action}
      </span>
    )
  }

  return (
    <div>
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">操作日志</h1>

          {/* 过滤条件 */}
          <div className="card mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">过滤条件</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  授权ID
                </label>
                <input
                  type="text"
                  value={filters.licenseId}
                  onChange={(e) => handleFilterChange('licenseId', e.target.value)}
                  className="input"
                  placeholder="授权ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  操作类型
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => handleFilterChange('action', e.target.value)}
                  className="input"
                >
                  <option value="">全部</option>
                  <option value="validate">验证</option>
                  <option value="activate">激活</option>
                  <option value="revoke">撤销</option>
                  <option value="expire">过期</option>
                  <option value="unbind">解绑</option>
                  <option value="create">创建</option>
                  <option value="renew">续期</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结果
                </label>
                <select
                  value={filters.result}
                  onChange={(e) => handleFilterChange('result', e.target.value)}
                  className="input"
                >
                  <option value="">全部</option>
                  <option value="success">成功</option>
                  <option value="fail">失败</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  操作者
                </label>
                <select
                  value={filters.operator}
                  onChange={(e) => handleFilterChange('operator', e.target.value)}
                  className="input"
                >
                  <option value="">全部</option>
                  <option value="admin">管理员</option>
                  <option value="client">客户端</option>
                  <option value="system">系统</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始时间
                </label>
                <input
                  type="datetime-local"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束时间
                </label>
                <input
                  type="datetime-local"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setFilters({
                  licenseId: '',
                  action: '',
                  result: '',
                  operator: '',
                  startDate: '',
                  endDate: ''
                })}
                className="btn btn-secondary"
              >
                清除过滤
              </button>
            </div>
          </div>

          {/* 日志列表 */}
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
                      <th>时间</th>
                      <th>操作</th>
                      <th>结果</th>
                      <th>授权码</th>
                      <th>详情</th>
                      <th>操作者</th>
                      <th>IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td>{new Date(log.created_at).toLocaleString()}</td>
                        <td>{getActionBadge(log.action)}</td>
                        <td>{getResultBadge(log.result)}</td>
                        <td className="font-mono text-sm">
                          {log.licenses?.license_key || '-'}
                        </td>
                        <td className="max-w-xs truncate">{log.detail || '-'}</td>
                        <td>{log.operator || '-'}</td>
                        <td className="font-mono text-xs">{log.ip || '-'}</td>
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

