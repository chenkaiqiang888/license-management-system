'use client'

import { useState } from 'react'

export default function TestPage() {
  const [testResult, setTestResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      // 测试授权列表API
      const response = await fetch('/api/licenses')
      const data = await response.json()
      
      if (data.success) {
        setTestResult('✅ API 测试成功！授权列表接口正常工作')
      } else {
        setTestResult('❌ API 返回错误: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      setTestResult('❌ API 测试失败: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setLoading(false)
    }
  }

  const testCreateLicense = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/licenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天后
          maxActivations: 1,
          note: '测试授权'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTestResult('✅ 创建授权成功！授权码: ' + data.data.license_key)
      } else {
        setTestResult('❌ 创建授权失败: ' + (data.error || '未知错误'))
      }
    } catch (error) {
      setTestResult('❌ 创建授权测试失败: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          系统测试
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={testAPI}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试 API 连接'}
          </button>
          
          <button
            onClick={testCreateLicense}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '测试中...' : '测试创建授权'}
          </button>
        </div>
        
        {testResult && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">测试结果:</h3>
            <p className="text-sm">{testResult}</p>
          </div>
        )}
        
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
