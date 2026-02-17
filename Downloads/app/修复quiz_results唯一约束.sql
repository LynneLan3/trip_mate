-- ========================================
-- 修复 quiz_results 表的唯一约束
-- 允许用户对同一问卷多次答题（保留最新记录）
-- ========================================

-- 1. 删除旧的唯一约束（如果存在）
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_key;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_quiz_id_key;

-- 2. 添加新的复合唯一约束：一个用户对一个问卷只能有一条记录
ALTER TABLE quiz_results 
  ADD CONSTRAINT quiz_results_user_id_quiz_id_key 
  UNIQUE (user_id, quiz_id);

-- 3. 验证约束
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'quiz_results'::regclass
  AND contype = 'u';

-- 完成
SELECT '✅ quiz_results 唯一约束已修复！' as status;
