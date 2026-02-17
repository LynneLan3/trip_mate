-- ========================================
-- 添加 quiz_results DELETE 权限
-- ========================================

-- 添加删除自己记录的权限
DROP POLICY IF EXISTS "quiz_results_delete_own" ON quiz_results;
CREATE POLICY "quiz_results_delete_own" ON quiz_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- 验证所有策略
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'quiz_results'
ORDER BY cmd;

SELECT '✅ DELETE 权限已添加！' as status;
