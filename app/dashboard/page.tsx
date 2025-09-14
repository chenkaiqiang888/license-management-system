'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totalLicenses: number
  activeLicenses: number
  revokedLicenses: number
  expiredLicenses: number
  totalActivations: number
  activeActivations: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [licensesRes, activationsRes] = await Promise.all([
        fetch('/api/licenses?limit=1000'),
        fetch('/api/activations?limit=1000')
      ])

      const licensesData = await licensesRes.json()
      const activationsData = await activationsRes.json()

      if (licensesData.success && activationsData.success) {
        const licenses = licensesData.data.licenses
        const activations = activationsData.data.activations

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
          activeActivations
        })
      }
    } catch (error) {
      console.error('获取仪表盘数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">仪表盘</h1>
            <Link
              href="/"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">总授权数</h3>
            <p className="text-3xl font-bold text-blue-600">{stats?.totalLicenses || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">活跃授权</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.activeLicenses || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">总激活数</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.totalActivations || 0}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
