# 部署指南

## 部署步骤

### 1. Supabase 数据库设置

1. 登录 [Supabase](https://supabase.com)
2. 创建新项目
3. 在 SQL 编辑器中执行建表语句（见 README.md）
4. 记录项目 URL 和 Service Role Key

### 2. Vercel 部署

1. 登录 [Vercel](https://vercel.com)
2. 导入 GitHub 仓库
3. 配置环境变量：
   - `SUPABASE_URL`: Supabase 项目 URL
   - `SUPABASE_SERVICE_KEY`: Supabase Service Role Key
   - `JWT_SECRET`: 随机生成的 JWT 密钥
4. 部署项目

### 3. 域名配置

1. 在 Vercel 项目设置中添加自定义域名
2. 更新客户端 SDK 中的 API URL

### 4. 测试部署

1. 访问管理后台
2. 创建测试授权
3. 使用客户端 SDK 验证授权

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase 服务密钥 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | JWT 签名密钥 | `your-secret-key-here` |

## 生产环境建议

1. **安全配置**
   - 使用强密码作为 JWT_SECRET
   - 定期轮换密钥
   - 启用 Supabase RLS（行级安全）

2. **监控告警**
   - 设置 Supabase 监控
   - 配置 Vercel 分析
   - 添加错误日志收集

3. **备份策略**
   - 定期备份数据库
   - 导出授权数据
   - 保存配置文件

4. **性能优化**
   - 启用 CDN
   - 数据库索引优化
   - API 缓存策略

## 故障排除

### 部署失败
- 检查环境变量配置
- 查看 Vercel 构建日志
- 确认 Node.js 版本兼容性

### 数据库连接失败
- 验证 Supabase URL 和密钥
- 检查网络连接
- 确认数据库表已创建

### 授权验证失败
- 检查 API 端点可访问性
- 验证 JWT 密钥配置
- 查看服务器日志

## 维护更新

1. **定期更新**
   - 更新依赖包
   - 应用安全补丁
   - 优化性能

2. **数据维护**
   - 清理过期日志
   - 归档旧数据
   - 监控存储使用

3. **功能扩展**
   - 添加新功能
   - 优化用户体验
   - 增强安全性

