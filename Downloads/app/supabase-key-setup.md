# Supabase API 密钥设置指南

## 🔑 获取正确的 API 密钥

### 步骤 1: 登录 Supabase 仪表板
1. 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. 登录你的账号

### 步骤 2: 找到你的项目
1. 在仪表板中找到你的项目（travel-buddy）
2. 点击进入项目

### 步骤 3: 获取 API 密钥
有两种方式获取密钥：

#### 方式 A: 通过 Connect 对话框
1. 在项目页面，点击左侧菜单的 "Connect"
2. 选择 "Web App" 或 "React"
3. 复制显示的 `anon` 密钥

#### 方式 B: 通过项目设置
1. 点击左侧菜单的 "Settings"（设置）
2. 点击 "API" 选项卡
3. 在 "Project API keys" 部分找到：
   - **Publishable Key** (推荐) - 格式: `sb_publishable_xxx`
   - 或 **Legacy anon key** - JWT 格式长字符串

### 步骤 4: 更新 .env 文件
1. 复制新的 API 密钥
2. 替换 `.env` 文件中的 `VITE_SUPABASE_ANON_KEY` 值

### 🔍 验证密钥
更新后，重启开发服务器：
```bash
npm run dev
```

然后在浏览器中测试登录功能。

## 🚨 重要提示
- 使用 **Publishable Key** (`sb_publishable_xxx`) 而不是旧的 JWT 格式的 anon key
- 确保密钥对应正确的项目（mlovmlldauuapejgzssm）
- 如果仍然有问题，可以尝试创建新的 API 密钥