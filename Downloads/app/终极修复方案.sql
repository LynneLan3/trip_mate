-- ========================================
-- 终极修复方案：彻底解决 409 错误
-- ========================================

-- 步骤1：完全清空新问卷数据（从零开始）
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

-- 步骤2：删除所有约束，重新创建
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_key;
ALTER TABLE quiz_results DROP CONSTRAINT IF EXISTS quiz_results_user_id_quiz_id_key;

-- 步骤3：清理所有可能的重复数据
DELETE FROM quiz_results a USING quiz_results b
WHERE a.id > b.id 
  AND a.user_id = b.user_id 
  AND a.quiz_id = b.quiz_id;

-- 步骤4：重新添加约束
ALTER TABLE quiz_results 
  ADD CONSTRAINT quiz_results_user_id_quiz_id_key 
  UNIQUE (user_id, quiz_id);

-- 步骤5：确保完整的 RLS 权限
DROP POLICY IF EXISTS "quiz_results_select_for_matches" ON quiz_results;
CREATE POLICY "quiz_results_select_for_matches" ON quiz_results
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1
      FROM matches m
      WHERE m.quiz_id = quiz_results.quiz_id
        AND (
          (m.requester_id = auth.uid() AND m.receiver_id = quiz_results.user_id)
          OR
          (m.receiver_id = auth.uid() AND m.requester_id = quiz_results.user_id)
        )
    )
  );

DROP POLICY IF EXISTS "quiz_results_insert_own" ON quiz_results;
CREATE POLICY "quiz_results_insert_own" ON quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_results_update_own" ON quiz_results;
CREATE POLICY "quiz_results_update_own" ON quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_results_delete_own" ON quiz_results;
CREATE POLICY "quiz_results_delete_own" ON quiz_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- 步骤6：验证配置
SELECT 
  conname as constraint_name
FROM pg_constraint
WHERE conrelid = 'quiz_results'::regclass
  AND contype = 'u';

SELECT 
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'quiz_results'
ORDER BY cmd;

SELECT '✅ 所有配置已重置！现在可以重新答题了' as status;
