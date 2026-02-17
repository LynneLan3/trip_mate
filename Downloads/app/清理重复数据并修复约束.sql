-- ========================================
-- 清理重复数据并修复 quiz_results 唯一约束
-- ========================================

-- 1. 先删除旧的唯一约束
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_key;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_quiz_id_key;

-- 2. 删除重复记录，只保留每个用户每个问卷的最新记录
DELETE FROM quiz_results
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, quiz_id) id
  FROM quiz_results
  ORDER BY user_id, quiz_id, created_at DESC
);

-- 3. 添加复合唯一约束
ALTER TABLE quiz_results 
  ADD CONSTRAINT quiz_results_user_id_quiz_id_key 
  UNIQUE (user_id, quiz_id);

-- 4. 验证结果
SELECT 
  user_id,
  quiz_id,
  COUNT(*) as count
FROM quiz_results
GROUP BY user_id, quiz_id
HAVING COUNT(*) > 1;

-- 如果上面查询返回空，说明清理成功
SELECT '✅ 重复数据已清理，唯一约束已添加！' as status;
