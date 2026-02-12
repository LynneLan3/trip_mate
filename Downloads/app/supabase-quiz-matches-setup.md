# 问卷提交与匹配功能 - Supabase 配置说明

若被分享者提交问卷时出现「提交失败」，或匹配记录无法创建，请按下列步骤检查并配置数据库。

## 1. quiz_results 表：唯一约束二选一

本应用支持两种常见设计，**任选其一**即可。

### 方式 A：每用户每问卷一条结果（推荐）

同一用户可参与多份问卷，每份问卷保留一条最新结果。

在 Supabase **SQL Editor** 中执行：

```sql
-- 若已有 UNIQUE(user_id)，先删除（见方式 B 说明）
-- ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_key;

-- 添加 (user_id, quiz_id) 唯一约束
ALTER TABLE quiz_results
  DROP CONSTRAINT IF EXISTS quiz_results_user_id_quiz_id_key;
ALTER TABLE quiz_results
  ADD CONSTRAINT quiz_results_user_id_quiz_id_key UNIQUE (user_id, quiz_id);
```

### 方式 B：每用户全局一条结果

每用户只保留一份问卷结果（后做的会覆盖先做的）。若你的表已经是 `UNIQUE(user_id)`，无需改约束，前端已兼容。

---

## 2. matches 表：允许被分享者（receiver）插入

被分享者完成问卷时，会由**当前登录用户（receiver）** 插入一条匹配记录：`requester_id`=分享人，`receiver_id`=自己。  
若未配置 RLS 或策略过严，会报 403 / 权限错误，导致「匹配记录创建失败」提示（问卷结果仍会保存）。

在 Supabase **SQL Editor** 中执行（按需调整表名/策略名）：

```sql
-- 确保 matches 表启用 RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 允许「当前用户作为 receiver」时插入（被分享者完成问卷时创建匹配）
DROP POLICY IF EXISTS "matches_insert_as_receiver" ON matches;
CREATE POLICY "matches_insert_as_receiver" ON matches
  FOR INSERT
  WITH CHECK (auth.uid() = receiver_id);

-- 允许用户查看自己作为 requester 或 receiver 的匹配
DROP POLICY IF EXISTS "matches_select_own" ON matches;
CREATE POLICY "matches_select_own" ON matches
  FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- 允许用户更新自己作为 requester 或 receiver 的匹配（用于同意/拒绝）
DROP POLICY IF EXISTS "matches_update_own" ON matches;
CREATE POLICY "matches_update_own" ON matches
  FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = receiver_id);
```

若你已有自定义策略，请保证至少存在一条 **INSERT** 策略，允许 `receiver_id = auth.uid()`。

---

## 3. quiz_results 表：RLS 建议

确保当前用户只能写入/读取自己的答题结果：

```sql
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- 允许用户插入自己的结果
DROP POLICY IF EXISTS "quiz_results_insert_own" ON quiz_results;
CREATE POLICY "quiz_results_insert_own" ON quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的结果
DROP POLICY IF EXISTS "quiz_results_update_own" ON quiz_results;
CREATE POLICY "quiz_results_update_own" ON quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许用户读取自己的结果；如需展示他人结果（如匹配页），可再加 SELECT 策略
DROP POLICY IF EXISTS "quiz_results_select_own" ON quiz_results;
CREATE POLICY "quiz_results_select_own" ON quiz_results
  FOR SELECT
  USING (auth.uid() = user_id);
```

若匹配页需要查询**对方**的 `quiz_results`（如匹配度计算），需额外一条 SELECT 策略，允许在「存在以当前用户为 requester 或 receiver 的 match」时读取对应 quiz 的 result；此处仅给出基础自读策略。

---

## 4. 开发者工具 / Console 403 说明

若浏览器提示「访问 localhost 的请求遭到拒绝 / HTTP 403」导致无法打开 Console：

- 多为浏览器扩展、安全策略或本地代理拦截，与前端代码无关。
- 本应用已在提交失败时通过**页面内 Toast** 展示简短错误信息（如「提交失败：xxx」），便于在不依赖 Console 的情况下排查。
- 可尝试：无痕模式、关闭扩展、换用其他浏览器或设备访问同一 localhost 页面。

配置完成后，建议用「分享链接 → 新用户注册 → 完成问卷」再测一次提交与匹配记录是否正常。
