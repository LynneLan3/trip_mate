# 驴友匹配项目

一个旅行伙伴匹配的 Web 应用，用户完成旅行性格测试后可以分享链接给朋友，双方都同意后才能看到彼此的联系方式。

## 功能特性

- 邮箱认证系统（注册/登录）
- 旅行风格问卷测试（10道题目）
- 智能标签匹配（躺平派/均衡派/活力派/特种兵）
- 分享链接和二维码
- 双向确认机制（保护隐私）
- 匹配度计算
- 响应式设计（支持移动端）

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase（数据库 + 认证）

## 快速开始

### 1. 配置 Supabase

1. 访问 [Supabase](https://supabase.com/) 注册账号
2. 创建一个新项目
3. 进入项目后，点击左侧 **SQL Editor**
4. 打开 `database-setup.sql` 文件，复制全部内容到 SQL Editor 中执行
5. 记录你的 **Project URL** 和 **Anon Key**（在 Project Settings > API 中查看）

### 2. 配置环境变量

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入你的 Supabase 信息：
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. 安装依赖并启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173 查看应用

### 4. 构建部署

```bash
# 构建生产版本
npm run build

# 构建输出在 dist/ 目录
```

## 数据库表结构

| 表名 | 说明 |
|------|------|
| questions | 题目表（题库） |
| options | 选项表 |
| quizzes | 问卷表 |
| quiz_questions | 问卷-题目关联表 |
| quiz_results | 答题记录表 |
| matches | 匹配关系表 |
| profiles | 用户资料表 |

## 页面说明

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录/注册 | `/auth` | 邮箱认证 |
| 首页 | `/` | 问卷列表 |
| 答题 | `/quiz/:quizId` | 逐题答题 |
| 结果 | `/result/:resultId` | 显示标签和分享 |
| 匹配管理 | `/matches` | 查看和管理匹配 |

## 隐私保护

- 使用 Supabase RLS（行级安全策略）保护数据
- 联系方式仅在双方匹配成功后可见
- 用户可以控制自己的资料可见性

## 开发文档

详见 `database-setup.sql` 文件中的完整数据库结构和初始数据。

## License

MIT
