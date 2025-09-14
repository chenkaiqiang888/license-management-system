export default function TestDeploy() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 部署成功！
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          授权管理系统已成功部署到 Vercel
        </p>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              系统功能
            </h2>
            <ul className="text-left space-y-2 text-gray-600">
              <li>✅ 授权码管理</li>
              <li>✅ 设备激活</li>
              <li>✅ 时间限制</li>
              <li>✅ 日志记录</li>
              <li>✅ 管理后台</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              访问 <a href="/" className="underline">主页</a> 开始使用系统
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
