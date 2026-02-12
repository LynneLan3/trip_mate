-- 创建头像存储桶
-- 在 Supabase Dashboard 中执行此脚本，或者手动创建存储桶

-- 1. 创建 avatars 存储桶（如果不存在）
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. 设置存储桶的公开访问策略
create policy "Avatar images are publicly accessible"
on storage.objects for select
using ( bucket_id = 'avatars' );

-- 3. 允许认证用户上传自己的头像
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- 4. 允许用户更新自己的头像
create policy "Users can update their own avatar"
on storage.objects for update
using (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- 5. 允许用户删除自己的头像
create policy "Users can delete their own avatar"
on storage.objects for delete
using (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);

-- 完成！现在用户可以上传头像了
