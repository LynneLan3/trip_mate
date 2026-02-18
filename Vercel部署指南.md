# Vercel 部署指南

## 📋 前提条件

1. ✅ 已注册 Vercel 账号（https://vercel.com）
2. ✅ 项目已推送到 GitHub/GitLab 等 Git 仓库
3. ✅ 已配置 Supabase 数据库

## 🚀 部署步骤

### 步骤1：连接 Git 仓库

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New..."** → **"Project"**
3. 选择你的 Git 仓库（GitHub/GitLab）
4. 选择包含 React 项目的仓库

### 步骤2：配置项目

在 Vercel 项目配置页面：

1. **Framework Preset**: 选择 `Vite`
2. **Root Directory**: 保持默认（根目录）
3. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 步骤3：设置环境变量

在 Vercel 项目设置中添加环境变量：

1. 点击项目 → **Settings** → **Environment Variables**
2. 添加以下变量：

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**如何获取 Supabase 密钥：**
1. 打开 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目 → **Settings** → **API**
3. 复制 `Project URL` 和 `anon public` 密钥

### 步骤4：部署

1. 点击 **"Deploy"** 按钮
2. 等待构建完成（通常需要 2-5 分钟）
3. 部署成功后会生成一个域名（如 `your-app.vercel.app`）

### 步骤5：自定义域名（可选）

如果想要自定义域名：

1. 在 Vercel 项目中 → **Settings** → **Domains**
2. 点击 **"Add"** 并输入你的域名
3. 按照提示配置 DNS 记录

## 🔧 常见问题

### 问题1：构建失败

**检查项目根目录是否有以下文件：**
- ✅ `package.json`
- ✅ `vite.config.ts`
- ✅ `vercel.json` (已创建)

**检查构建命令：**
```bash
npm run build  # 应该能成功构建
```

### 问题2：环境变量不生效

**确保变量名称正确：**
- ✅ `VITE_SUPABASE_URL` (注意 VITE_ 前缀)
- ✅ `VITE_SUPABASE_ANON_KEY` (注意 VITE_ 前缀)

### 问题3：数据库连接失败

**检查 Supabase 配置：**
- ✅ URL 格式正确（以 https:// 开头）
- ✅ 匿名密钥正确
- ✅ Supabase 项目已启用

### 问题4：重新部署

**推送代码到 Git 后自动部署：**
- 推送代码到 main/master 分支
- Vercel 会自动重新构建和部署

## 📝 项目文件说明

已创建的文件：

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "devCommand": "npm run dev"
}
```

### `.env.example`
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## 🎯 部署后的功能测试

部署完成后，测试以下功能：

1. ✅ 首页加载正常
2. ✅ 用户可以注册/登录
3. ✅ 可以答题并查看结果
4. ✅ 可以分享链接给朋友
5. ✅ 匹配功能正常
6. ✅ 可以创建自定义问卷

## 🌟 优化建议

### 性能优化
- Vercel 会自动启用 CDN
- 静态资源会自动压缩
- 可以考虑添加 Service Worker 缓存

### 监控和分析
- Vercel Analytics：实时监控访问量
- Vercel Speed Insights：性能分析
- Error tracking：错误监控

## 📞 获取帮助

如果遇到问题：
1. 检查 Vercel 构建日志
2. 检查浏览器控制台错误
3. 验证环境变量配置
4. 查看 Supabase 连接状态

---

**准备好部署了吗？现在就开始吧！** 🚀