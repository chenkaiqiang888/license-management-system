# 授权管理系统

一个完整的软件授权码管理系统，支持授权码生成、验证、设备绑定、时间限制等功能。

## 功能特性

- ✅ 授权码生成与管理
- ✅ 时间限制控制
- ✅ 设备绑定与激活数量限制
- ✅ 管理后台界面
- ✅ 操作日志记录
- ✅ 客户端 SDK 集成
- ✅ 自动 token 刷新
- ✅ 多平台支持（Web、Python）

## 技术栈

- **前端**: Next.js 14 + React + Tailwind CSS
- **后端**: Next.js API Routes (Serverless Functions)
- **数据库**: Supabase (PostgreSQL)
- **部署**: Vercel
- **客户端**: JavaScript SDK + Python SDK

## 快速开始

### 1. 环境准备

确保已安装以下工具：
- Node.js 18+
- Git
- Supabase 账号
- Vercel 账号

### 2. 数据库设置

1. 在 Supabase 创建新项目
2. 在 SQL 编辑器中执行以下建表语句：

```sql
-- 产品表（可选）
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name varchar(64) not null,
  description text,
  created_at timestamptz default now()
);

-- 授权码表
create table if not exists licenses (
  id uuid primary key default gen_random_uuid(),
  license_key varchar(64) not null unique,
  product_id uuid references products(id),
  start_time timestamptz not null,
  end_time timestamptz not null,
  status varchar(16) not null default 'active',
  max_activations int not null default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  note text
);

-- 激活记录表
create table if not exists activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references licenses(id) on delete cascade,
  device_id varchar(128) not null,
  device_info text,
  activated_at timestamptz default now(),
  unbound_at timestamptz,
  unique (license_id, device_id)
);

-- 授权日志表
create table if not exists license_logs (
  id uuid primary key default gen_random_uuid(),
  license_id uuid references licenses(id) on delete cascade,
  action varchar(32) not null,
  result varchar(16) not null,
  detail text,
  operator varchar(64),
  ip varchar(64),
  created_at timestamptz default now()
);
```

### 3. 项目配置

1. 克隆项目：
```bash
git clone <your-repo-url>
cd license-management-system
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
```bash
cp env.example .env.local
```

编辑 `.env.local` 文件：
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
```

### 4. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000 查看管理后台。

### 5. 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## API 接口

### 授权管理接口

- `POST /api/licenses/create` - 创建授权
- `POST /api/licenses/revoke` - 撤销授权
- `POST /api/licenses/renew` - 续期授权
- `GET /api/licenses` - 查询授权列表
- `GET /api/licenses/:id` - 查看授权详情

### 客户端接口

- `POST /api/validate` - 验证授权码

### 激活管理接口

- `GET /api/activations` - 查询激活记录
- `POST /api/activations/unbind` - 解绑设备

### 日志接口

- `GET /api/logs` - 查询操作日志

## 客户端集成

### JavaScript 客户端

```javascript
// 引入 SDK
const LicenseClient = require('./client-sdk/license-client.js')

// 创建客户端
const client = new LicenseClient({
  apiUrl: 'https://your-domain.vercel.app/api',
  onTokenExpired: () => console.log('授权已过期'),
  onValidationFailed: (error) => console.log('验证失败:', error)
})

// 验证授权
const result = await client.validateLicense('YOUR_LICENSE_KEY')
if (result.success) {
  console.log('授权验证成功')
} else {
  console.log('授权验证失败:', result.error)
}

// 检查授权状态
if (client.isAuthorized()) {
  console.log('当前已授权')
}
```

### Python 客户端

```python
from license_client import LicenseClient

# 创建客户端
client = LicenseClient(
    api_url='https://your-domain.vercel.app/api',
    license_key='YOUR_LICENSE_KEY'
)

# 验证授权
result = client.validate_license()
if result['success']:
    print('授权验证成功')
else:
    print('授权验证失败:', result['error'])

# 检查授权状态
if client.is_authorized():
    print('当前已授权')
```

## 管理后台功能

### 仪表盘
- 授权统计概览
- 最近操作日志
- 系统状态监控

### 授权管理
- 创建新授权
- 查看授权列表
- 撤销/续期授权
- 搜索和过滤

### 激活管理
- 查看设备激活记录
- 解绑设备
- 激活状态监控

### 日志管理
- 查看操作日志
- 按条件过滤
- 导出日志数据

## 安全特性

- JWT token 认证
- 设备指纹绑定
- 时间限制控制
- 激活数量限制
- 操作日志记录
- HTTPS 强制加密

## 扩展功能

### 已实现
- 基础授权管理
- 设备绑定
- 时间控制
- 管理后台
- 客户端 SDK

### 可扩展
- 订阅制授权
- 支付集成（Stripe）
- 邮件通知
- 批量导入导出
- 高级防破解
- 多产品支持

## 故障排除

### 常见问题

1. **授权验证失败**
   - 检查授权码格式（16位）
   - 确认授权状态（active）
   - 检查时间是否过期

2. **设备激活超限**
   - 检查最大激活数设置
   - 解绑不需要的设备

3. **Token 过期**
   - 客户端会自动刷新
   - 手动重新验证授权

### 日志查看

在管理后台的"操作日志"页面可以查看详细的验证和操作记录。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

