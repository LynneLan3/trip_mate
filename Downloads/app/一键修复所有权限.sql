-- ========================================
-- 一键修复所有数据库权限问题
-- ========================================

-- ==================== profiles表 ====================
-- 允许查询所有用户的基本信息（用于显示好友信息）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==================== quiz_results表 ====================
-- 允许查询有匹配关系的用户的答题结果
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

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

-- ==================== matches表 ====================
-- 允许插入和查询匹配记录
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_insert_as_receiver" ON matches;
CREATE POLICY "matches_insert_as_receiver" ON matches
  FOR INSERT
  WITH CHECK (auth.uid() = receiver_id);

DROP POLICY IF EXISTS "matches_select_own" ON matches;
CREATE POLICY "matches_select_own" ON matches
  FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "matches_update_own" ON matches;
CREATE POLICY "matches_update_own" ON matches
  FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- ==================== 验证结果 ====================
-- 查看所有表的策略
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NULL THEN 'No restriction'
    ELSE 'Has restriction'
  END as has_restriction
FROM pg_policies
WHERE tablename IN ('profiles', 'quiz_results', 'matches')
ORDER BY tablename, cmd;

-- 完成！
SELECT 'All RLS policies updated successfully!' as status;
