-- 修复quiz_results表RLS策略 - 允许查询匹配用户的答题结果

-- 1. 检查当前策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'quiz_results';

-- 2. 启用RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- 3. 删除旧的限制性策略
DROP POLICY IF EXISTS "quiz_results_select_own" ON quiz_results;

-- 4. 创建新策略 - 允许查询有匹配关系的用户的答题结果
DROP POLICY IF EXISTS "quiz_results_select_for_matches" ON quiz_results;
CREATE POLICY "quiz_results_select_for_matches" ON quiz_results
  FOR SELECT
  USING (
    -- 可以查看自己的结果
    auth.uid() = user_id
    OR
    -- 可以查看有匹配关系的用户的结果
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

-- 5. 保留插入更新策略
DROP POLICY IF EXISTS "quiz_results_insert_own" ON quiz_results;
CREATE POLICY "quiz_results_insert_own" ON quiz_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_results_update_own" ON quiz_results;
CREATE POLICY "quiz_results_update_own" ON quiz_results
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. 验证策略
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'quiz_results'
ORDER BY cmd;
