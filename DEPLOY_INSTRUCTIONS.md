# 授权管理系统 - 部署说明

## 🚀 Vercel 部署步骤

### 1. 准备工作
- ✅ 代码已添加密码保护功能
- ✅ 环境变量已配置
- ✅ 所有功能已测试

### 2. 部署到 Vercel

#### 方法一：通过 Vercel 网站（推荐）

1. **访问 Vercel**：
   - 打开 [vercel.com](https://vercel.com)
   - 用 GitHub 账号登录

2. **导入项目**：
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置环境变量**：
   在项目设置中添加以下环境变量：
   ```
   SUPABASE_URL=https://qjukpzpvbxajiawdlcxo.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqdWtwenB2Ynhhamlhd2RsY3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODA2MjksImV4cCI6MjA3MzQ1NjYyOX0.aJMbToTrs2jypBVM_b4LsR2dgAIxXquS1huLViUgu0Y
   JWT_SECRET=your-super-secret-jwt-key-here-2024
   ADMIN_PASSWORD=你的强密码
   ```

4. **部署**：
   - 点击 "Deploy"
   - 等待部署完成

#### 方法二：通过 Vercel CLI

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
vercel env add ADMIN_PASSWORD
```

### 3. 部署后访问

部署完成后，你会获得类似这样的地址：
- `https://your-project-name.vercel.app`
- `https://your-project-name.vercel.app/login` - 管理员登录
- `https://your-project-name.vercel.app/dashboard` - 管理后台

### 4. 安全设置

#### 修改默认密码
1. 在 Vercel 项目设置中修改 `ADMIN_PASSWORD` 环境变量
2. 设置一个强密码（建议包含大小写字母、数字、特殊字符）
3. 重新部署项目

#### 访问控制
- 只有知道密码的人才能访问管理后台
- 所有管理页面都需要登录验证
- 支持登出功能

### 5. 使用方式

1. **电脑访问**：
   - 打开 `https://your-project-name.vercel.app`
   - 点击 "管理员登录"
   - 输入密码进入管理后台

2. **手机访问**：
   - 在手机浏览器输入相同网址
   - 登录后可以正常使用所有功能

3. **功能使用**：
   - 创建授权码
   - 管理激活记录
   - 查看操作日志
   - 系统统计概览

### 6. 安全建议

1. **强密码**：使用复杂的密码
2. **定期更换**：定期更换管理员密码
3. **HTTPS**：Vercel 自动提供 HTTPS 加密
4. **备份**：定期备份重要数据

## 🎉 部署完成

部署完成后，你就可以在任何地方、任何设备上安全地管理你的授权系统了！

**默认密码**：`admin123456`（请立即修改）
