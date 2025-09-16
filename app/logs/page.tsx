'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

interface Log {
  id: string
  license_id: string
  action: 'validate' | 'activate' | 'revoke' | 'expire' | 'unbind'
  result: 'success' | 'fail'
  detail?: string
  operator?: string
  ip?: string
  created_at: string
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
        limit: '20'
      })
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value)
        }
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
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      licenseId: '',
      action: '',
      result: '',
      startDate: '',
      endDate: ''
    })
    setCurrentPage(1)
  }

  const getActionBadge = (action: string) => {
    const colors = {
      validate: 'bg-blue-100 text-blue-800',
      activate: 'bg-green-100 text-green-800',
      revoke: 'bg-red-100 text-red-800',
      expire: 'bg-yellow-100 text-yellow-800',
      unbind: 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`status-badge ${colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {action}
      </span>
    )
  }

  return (
    <AdminLayout title="操作日志" subtitle="查看系统操作和审计日志">
      <div className="space-y-6">
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
                <option value="">全部操作</option>
                <option value="validate">验证</option>
                <option value="activate">激活</option>
                <option value="revoke">撤销</option>
                <option value="expire">过期</option>
                <option value="unbind">解绑</option>
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
                <option value="">全部结果</option>
                <option value="success">成功</option>
                <option value="fail">失败</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始日期
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束日期
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="input"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn btn-secondary mr-2"
              >
                清除筛选
              </button>
              <button
                onClick={fetchLogs}
                className="btn btn-primary"
              >
                搜索
              </button>
            </div>
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
                    <th>授权ID</th>
                    <th>操作</th>
                    <th>结果</th>
                    <th>详情</th>
                    <th>操作者</th>
                    <th>IP地址</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="font-mono text-sm">
                        {log.license_id}
                      </td>
                      <td>
                        {getActionBadge(log.action)}
                      </td>
                      <td>
                        <span className={`status-badge ${
                          log.result === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.result === 'success' ? '成功' : '失败'}
                        </span>
                      </td>
                      <td className="max-w-xs truncate">
                        {log.detail || '-'}
                      </td>
                      <td className="text-sm">
                        {log.operator || '-'}
                      </td>
                      <td className="font-mono text-sm">
                        {log.ip || '-'}
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
    </AdminLayout>
  )
}