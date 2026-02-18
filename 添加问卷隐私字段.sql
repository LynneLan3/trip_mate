-- 为 quizzes 表添加 is_public 和 creator_id 字段
-- 请在 Supabase SQL Editor 中执行此脚本

-- 1. 添加 creator_id 字段（关联 auth.users）
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. 添加 is_public 字段（默认为 true，保持旧数据在首页可见）
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- 3. 为已有问卷设置为公开（保持向后兼容）
UPDATE quizzes SET is_public = true WHERE is_public IS NULL;

-- 4. 添加索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_creator_id ON quizzes(creator_id);

-- 5. 更新 RLS 策略：允许创建者更新/删除自己的问卷
-- 先删除可能存在的旧策略（如有）
DROP POLICY IF EXISTS "Users can update own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Users can insert quizzes" ON quizzes;

-- 允许已登录用户创建问卷
CREATE POLICY "Users can insert quizzes"
ON quizzes FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- 允许创建者更新自己的问卷
CREATE POLICY "Users can update own quizzes"
ON quizzes FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- 允许创建者删除自己的问卷
CREATE POLICY "Users can delete own quizzes"
ON quizzes FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- 验证结果
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'quizzes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
