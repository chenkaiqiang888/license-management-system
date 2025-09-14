'use client'

import { useState, useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Link from 'next/link'

interface DashboardStats {
  totalLicenses: number
  activeLicenses: number
  revokedLicenses: number
  expiredLicenses: number
  totalActivations: number
  activeActivations: number
  recentLogs: any[]
  recentLicenses: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // 获取真实数据
      const [licensesRes, activationsRes, logsRes] = await Promise.all([
        fetch('/api/licenses?limit=1000'),
        fetch('/api/activations?limit=1000'),
        fetch('/api/logs?limit=10')
      ])

      const licensesData = await licensesRes.json()
      const activationsData = await activationsRes.json()
      const logsData = await logsRes.json()

      if (licensesData.success && activationsData.success && logsData.success) {
        const licenses = licensesData.data.licenses
        const activations = activationsData.data.activations
        const logs = logsData.data.logs

        const totalLicenses = licenses.length
        const activeLicenses = licenses.filter((l: any) => l.status === 'active').length
        const revokedLicenses = licenses.filter((l: any) => l.status === 'revoked').length
        const expiredLicenses = licenses.filter((l: any) => l.status === 'expired').length
        const totalActivations = activations.length
        const activeActivations = activations.filter((a: any) => !a.unbound_at).length

        setStats({
          totalLicenses,
          activeLicenses,
          revokedLicenses,
          expiredLicenses,
          totalActivations,
          activeActivations,
          recentLogs: logs,
          recentLicenses: licenses.slice(0, 3) // 显示最近3个授权
        })
      } else {
        console.error('获取数据失败:', { licensesData, activationsData, logsData })
        // 如果API失败，使用模拟数据作为后备
        setStats({
          totalLicenses: 0,
          activeLicenses: 0,
          revokedLicenses: 0,
          expiredLicenses: 0,
          totalActivations: 0,
          activeActivations: 0,
          recentLogs: [],
          recentLicenses: []
        })
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
      // 如果发生错误，使用模拟数据作为后备
      setStats({
        totalLicenses: 0,
        activeLicenses: 0,
        revokedLicenses: 0,
        expiredLicenses: 0,
        totalActivations: 0,
        activeActivations: 0,
        recentLogs: [],
        recentLicenses: []
      })
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    const icons = {
      validate: '🔍',
      activate: '⚡',
      revoke: '❌',
      create: '➕',
      renew: '🔄',
      expire: '⏰'
    }
    return icons[action as keyof typeof icons] || '📝'
  }

  const getActionColor = (action: string) => {
    const colors = {
      validate: 'text-blue-600',
      activate: 'text-green-600',
      revoke: 'text-red-600',
      create: 'text-purple-600',
      renew: 'text-indigo-600',
      expire: 'text-yellow-600'
    }
    return colors[action as keyof typeof colors] || 'text-gray-600'
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        class: 'bg-green-100 text-green-800 border-green-200', 
        icon: '✓',
        text: '活跃'
      },
      revoked: { 
        class: 'bg-red-100 text-red-800 border-red-200', 
        icon: '✕',
        text: '已撤销'
      },
      expired: { 
        class: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: '⏰',
        text: '已过期'
      }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.class}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Navigation />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">仪表盘</h1>
              <p className="text-gray-600">系统概览和关键指标监控</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-white/20 text-gray-700 rounded-lg hover:bg-white/90 transition-all duration-200 shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新数据
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总授权数</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalLicenses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">活跃授权</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeLicenses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">设备激活</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeActivations || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已过期</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.expiredLicenses || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 最近操作日志 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">最近操作日志</h2>
              <Link 
                href="/logs"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                查看全部
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentLogs.map((log) => (
                <div key={log.id} className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-lg">
                  <div className={`text-lg ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {log.action} - {log.result}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{log.detail}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最近授权 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">最近授权</h2>
              <Link 
                href="/licenses"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                查看全部
              </Link>
            </div>
            <div className="space-y-4">
              {stats?.recentLicenses.map((license) => (
                <div key={license.id} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-mono text-sm font-medium text-gray-900">
                      {license.license_key}
                    </div>
                    {getStatusBadge(license.status)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(license.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">快速操作</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/licenses"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">授权管理</p>
                <p className="text-xs text-gray-500">管理授权码</p>
              </div>
            </Link>

            <Link 
              href="/activations"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-green-500 rounded-lg group-hover:bg-green-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">激活记录</p>
                <p className="text-xs text-gray-500">查看设备激活</p>
              </div>
            </Link>

            <Link 
              href="/logs"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">操作日志</p>
                <p className="text-xs text-gray-500">查看系统日志</p>
              </div>
            </Link>

            <Link 
              href="/test"
              className="flex items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all duration-200 group"
            >
              <div className="p-2 bg-orange-500 rounded-lg group-hover:bg-orange-600 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">系统测试</p>
                <p className="text-xs text-gray-500">测试系统功能</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}