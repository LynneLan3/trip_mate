-- 验证数据库字段是否正确添加
-- 在 Supabase SQL Editor 中执行此查询

-- 1. 检查 quizzes 表的结构
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'quizzes'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 检查现有问卷的数量和状态
SELECT
  id,
  title,
  is_public,
  creator_id,
  created_at
FROM quizzes
ORDER BY created_at DESC
LIMIT 10;

-- 3. 检查 RLS 策略
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'quizzes'
ORDER BY policyname;

-- 4. 测试查询（应该只返回公开问卷）
SELECT
  id,
  title,
  is_public
FROM quizzes
WHERE is_public = true
ORDER BY created_at DESC;