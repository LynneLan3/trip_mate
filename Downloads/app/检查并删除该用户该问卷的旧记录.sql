-- ========================================
-- 检查并删除特定用户的特定问卷记录
-- 用于调试 409 错误
-- ========================================

-- 1. 查看所有 quiz_results 记录（查看是否有重复）
SELECT 
  id,
  user_id,
  quiz_id,
  score,
  tag,
  created_at
FROM quiz_results
ORDER BY created_at DESC
LIMIT 20;

-- 2. 检查是否有重复的 (user_id, quiz_id) 组合
SELECT 
  user_id,
  quiz_id,
  COUNT(*) as duplicate_count
FROM quiz_results
GROUP BY user_id, quiz_id
HAVING COUNT(*) > 1;

-- 3. 查看当前数据库约束
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'quiz_results'::regclass;

-- 4. 如果发现重复，删除所有新问卷的答题记录（重新开始）
-- 取消下面注释来删除新问卷的所有记录
/*
DELETE FROM quiz_results
WHERE quiz_id IN (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000005'
);
*/

SELECT '✅ 检查完成！查看上面的结果' as status;
