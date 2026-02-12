-- 修复profiles表RLS策略 - 解决406错误

-- 1. 检查当前profiles表的RLS策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 2. 启用RLS（如果未启用）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. 删除可能限制过严的旧策略
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;

-- 4. 创建新的查询策略 - 允许读取所有用户的基本信息（用于匹配功能）
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT
  USING (true);

-- 5. 保留插入和更新策略 - 只能操作自己的
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6. 验证策略
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;
