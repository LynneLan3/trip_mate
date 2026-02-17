-- ========================================
-- 一键彻底修复 409 错误
-- ========================================

-- 1. 清空新问卷的所有旧数据
DELETE FROM matches WHERE quiz_id IN (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000005'
);

DELETE FROM quiz_results WHERE quiz_id IN (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000005'
);

-- 2. 修复 quiz_results 约束
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_key;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_quiz_id_key;
ALTER TABLE quiz_results 
  ADD CONSTRAINT quiz_results_user_id_quiz_id_key 
  UNIQUE (user_id, quiz_id);

-- 3. 修复 matches 约束
DELETE FROM matches
WHERE id NOT IN (
  SELECT DISTINCT ON (requester_id, receiver_id, quiz_id) id
  FROM matches
  ORDER BY requester_id, receiver_id, quiz_id, created_at ASC
);

ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_unique_match;
ALTER TABLE matches 
  ADD CONSTRAINT matches_unique_match 
  UNIQUE (requester_id, receiver_id, quiz_id);

-- 4. 确保 DELETE 权限
DROP POLICY IF EXISTS "quiz_results_delete_own" ON quiz_results;
CREATE POLICY "quiz_results_delete_own" ON quiz_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. 验证
SELECT '✅ 所有问题已修复！' as status;
SELECT '现在请：' as step1;
SELECT '1. 强制刷新浏览器 (Ctrl+Shift+R 或 Cmd+Shift+R)' as step2;
SELECT '2. 重新答题测试' as step3;
