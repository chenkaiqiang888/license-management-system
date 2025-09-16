'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/AdminLayout'

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
      <AdminLayout title="仪表盘" subtitle="系统统计概览">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mx-auto mb-4"></div>
            <p className="text-white/70">加载中...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="仪表盘" subtitle="系统统计概览">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg mr-4">
              <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white/90 mb-1">总授权数</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalLicenses || 0}</p>
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
              <h3 className="text-lg font-medium text-white/90 mb-1">活跃授权</h3>
              <p className="text-3xl font-bold text-white">{stats?.activeLicenses || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/20 rounded-lg mr-4">
              <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white/90 mb-1">总激活数</h3>
              <p className="text-3xl font-bold text-white">{stats?.totalActivations || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
