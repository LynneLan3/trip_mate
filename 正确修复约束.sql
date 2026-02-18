-- ========================================
-- 正确修复约束（约束名是 unique_user_quiz_result）
-- ========================================

-- 1. 删除正确的约束名称
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS unique_user_quiz_result;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_key;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_quiz_id_key;

-- 2. 清空新问卷的旧数据
DELETE FROM quiz_results WHERE quiz_id IN (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000005'
);

-- 3. 清理所有重复数据
DELETE FROM quiz_results a USING quiz_results b
WHERE a.id > b.id 
  AND a.user_id = b.user_id 
  AND a.quiz_id = b.quiz_id;

-- 4. 重新添加约束（使用原来的名称）
ALTER TABLE quiz_results 
  ADD CONSTRAINT unique_user_quiz_result 
  UNIQUE (user_id, quiz_id);

SELECT '✅ 约束已正确修复！现在可以答题了' as status;
