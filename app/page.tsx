import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 授权管理系统
          </h1>
          <p className="text-gray-600 mb-8">
            基于 Next.js 和 Supabase 的网页后台授权管理系统
          </p>
          
          <div className="space-y-4">
            <Link 
              href="/login"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
            >
              登录管理后台
            </Link>
            
            <Link 
              href="/test-deploy"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors block text-center"
            >
              测试页面
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>✅ 部署成功</p>
            <p>✅ 系统正常运行</p>
          </div>
        </div>
      </div>
    </div>
  )
}