-- ========================================
-- 检查并修复 matches 表约束
-- ========================================

-- 1. 查看 matches 表的约束
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'matches'::regclass;

-- 2. 查看是否有重复的匹配记录
SELECT 
  requester_id,
  receiver_id,
  quiz_id,
  COUNT(*) as duplicate_count
FROM matches
GROUP BY requester_id, receiver_id, quiz_id
HAVING COUNT(*) > 1;

-- 3. 如果有重复，清理重复记录（保留最早的）
DELETE FROM matches
WHERE id NOT IN (
  SELECT DISTINCT ON (requester_id, receiver_id, quiz_id) id
  FROM matches
  ORDER BY requester_id, receiver_id, quiz_id, created_at ASC
);

-- 4. 添加唯一约束（如果不存在）
ALTER TABLE matches 
  DROP CONSTRAINT IF EXISTS matches_unique_match;
  
ALTER TABLE matches 
  ADD CONSTRAINT matches_unique_match 
  UNIQUE (requester_id, receiver_id, quiz_id);

SELECT '✅ matches 表约束已修复！' as status;
