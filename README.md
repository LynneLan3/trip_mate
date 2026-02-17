# 🧳 旅行问卷匹配系统

一个帮助旅行爱好者找到志同道合旅伴的智能匹配应用。

## ✨ 核心功能

### 🎯 预设问卷（5个主题）
- 🗺️ **目的地偏好测试** - 了解你的旅行目的地偏好
- 🍽️ **餐饮习惯测试** - 发现你的美食偏好
- 💰 **消费习惯测试** - 了解你的旅行预算风格
- 🏨 **住宿偏好测试** - 找到你的理想住宿方式
- 🎯 **景点偏好测试** - 发现你的旅行兴趣点

每个问卷包含 10 道精心设计的题目，帮助你全面了解自己的旅行风格。

### 📝 自定义问卷
- 用户可以创建自己的问卷
- 支持 1-10 道单选题
- 每道题支持 2-6 个选项
- 自定义分数和评分规则

### 💕 智能匹配系统
- **答案匹配度**：根据相同答案的题目数量计算
- **风格相似度**：基于分数差异评估
- **双向确认**：双方同意后可查看联系方式
- **匹配管理**：查看、同意、拒绝匹配请求

### 🔗 分享功能
- 生成专属邀请链接
- 扫描二维码快速邀请
- 朋友完成答题后自动创建匹配

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式框架**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **路由**: React Router v6
- **后端服务**: Supabase
  - 认证系统（Auth）
  - 数据库（PostgreSQL）
  - 行级安全（RLS）
- **部署**: Vercel

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/LynneLan3/trip_mate.git
cd trip_mate
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 初始化数据库

在 Supabase SQL Editor 中依次执行以下脚本：

1. `一键修复所有权限.sql` - 配置数据库权限
2. `正确修复约束.sql` - 设置唯一约束
3. `新增5个问卷类型.sql` - 导入预设问卷

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

## 📦 部署到 Vercel

### 方法一：Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New..." → "Project"
3. 选择 `trip_mate` 仓库
4. 选择 `main` 分支
5. 添加环境变量（同上）
6. 点击 "Deploy"

### 方法二：Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

## 📊 数据库结构

### 核心表

- **quizzes** - 问卷表
- **questions** - 题目表
- **options** - 选项表
- **quiz_questions** - 问卷题目关联表
- **quiz_results** - 答题结果表
- **matches** - 匹配记录表
- **profiles** - 用户资料表

## 🎨 界面特色

- 🌈 **磨玻璃效果**：现代化的半透明设计
- 📱 **响应式布局**：完美适配手机和桌面
- ✨ **平滑动画**：优雅的过渡效果
- 🎯 **直观交互**：清晰的用户引导

## 📖 功能说明

### 用户流程

1. **注册/登录** → 完成身份认证
2. **选择问卷** → 浏览问卷列表
3. **开始答题** → 回答 10 道题目
4. **查看结果** → 获得旅行风格标签
5. **分享链接** → 邀请朋友参与
6. **查看匹配** → 查看匹配度和对方信息
7. **双向确认** → 同意后交换联系方式

### 匹配算法

```
匹配度 = (相同答案数量 / 总题目数量) × 100%
```

例如：10 道题中有 8 道答案相同，匹配度为 80%。

## 🔐 安全特性

- ✅ Row Level Security (RLS) 保护所有数据
- ✅ 用户只能查看和修改自己的数据
- ✅ 匹配确认后才能查看联系方式
- ✅ HTTPS 加密传输

## 📝 开发说明

### 项目结构

```
src/
├── components/     # UI 组件
├── lib/           # 工具函数和配置
│   └── supabase/  # Supabase 客户端
├── pages/         # 页面组件
│   ├── HomePage.tsx          # 首页
│   ├── CreateQuizPage.tsx    # 创建问卷
│   ├── QuizPage.tsx          # 答题页
│   ├── ResultPage.tsx        # 结果页
│   ├── MatchesPage.tsx       # 匹配列表
│   ├── ProfilePage.tsx       # 个人资料
│   └── AuthPage.tsx          # 登录注册
└── App.tsx        # 路由配置
```

### 可用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # 代码检查
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可

MIT License

---

**开始你的旅行匹配之旅吧！** 🎉
