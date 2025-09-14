# 授权管理系统 - 部署指南

## 🚀 Vercel 部署步骤

### 1. 准备工作

确保你已经完成以下步骤：
- ✅ 项目代码已提交到 GitHub
- ✅ Supabase 数据库已配置
- ✅ 环境变量已准备

### 2. 部署到 Vercel

#### 方法一：通过 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 设置环境变量
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add JWT_SECRET
vercel env add ADMIN_EMAIL
vercel env add ADMIN_PASSWORD
```

#### 方法二：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 在 "Environment Variables" 中添加以下变量：

```
SUPABASE_URL=https://qjukpzpvbxajiawdlcxo.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdWtwenB2Ynhhamlhd2RsY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODA2MjksImV4cCI6MjA3MzQ1NjYyOX0.aJMbToTrs2jypBVM_b4LsR2dgAIxXquS1huLViUgu0Y
JWT_SECRET=your-super-secret-jwt-key-here-2024
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 3. 环境变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `SUPABASE_URL` | Supabase 项目 URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase 服务密钥 | `eyJhbGciOiJIUzI1NiIs...` |
| `JWT_SECRET` | JWT 签名密钥 | `your-super-secret-jwt-key-here-2024` |
| `ADMIN_EMAIL` | 管理员邮箱 | `admin@example.com` |
| `ADMIN_PASSWORD` | 管理员密码 | `admin123` |

### 4. 部署后验证

部署完成后，访问你的 Vercel 域名：

1. **首页**: `https://your-app.vercel.app`
2. **登录页**: `https://your-app.vercel.app/login`
3. **授权管理**: `https://your-app.vercel.app/licenses`

### 5. 测试功能

- [ ] 登录管理员账户
- [ ] 创建新授权
- [ ] 查看仪表盘数据
- [ ] 测试客户端验证 API

### 6. 生产环境优化

#### 安全建议

1. **更改默认密码**：
   ```bash
   vercel env add ADMIN_PASSWORD
   # 输入强密码
   ```

2. **使用强 JWT 密钥**：
   ```bash
   vercel env add JWT_SECRET
   # 输入随机生成的强密钥
   ```

3. **配置域名**：
   - 在 Vercel 项目设置中添加自定义域名
   - 配置 SSL 证书

#### 性能优化

1. **启用缓存**：Vercel 自动启用 CDN 缓存
2. **监控性能**：使用 Vercel Analytics
3. **错误监控**：集成 Sentry 或类似服务

### 7. 故障排除

#### 常见问题

1. **环境变量未生效**：
   - 检查变量名拼写
   - 重新部署项目
   - 查看 Vercel 函数日志

2. **数据库连接失败**：
   - 检查 Supabase URL 和密钥
   - 确认 Supabase 项目状态
   - 检查网络连接

3. **构建失败**：
   - 检查 `package.json` 依赖
   - 查看构建日志
   - 确保 TypeScript 类型正确

#### 查看日志

```bash
# 查看部署日志
vercel logs

# 查看实时日志
vercel logs --follow
```

### 8. 更新部署

每次代码更新后，Vercel 会自动重新部署。你也可以手动触发：

```bash
# 重新部署
vercel --prod

# 或通过 Git 推送
git push origin main
```

## 📞 技术支持

如果遇到问题，请检查：
1. Vercel 部署日志
2. Supabase 数据库状态
3. 环境变量配置
4. 网络连接

---

**部署完成后，你的授权管理系统就可以在互联网上使用了！** 🎉

