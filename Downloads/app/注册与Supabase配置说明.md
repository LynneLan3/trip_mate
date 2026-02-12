# 注册与 Supabase 配置说明

## 问题原因说明

若出现「提示注册成功但未跳转、数据库里看不到新用户」：

1. **Supabase 默认可能开启了「邮箱确认」**  
   开启后，`signUp` 会创建用户但**不会**返回 session，需要用户点击邮件里的链接完成验证后才会登录。  
   因此：前端拿不到 session → 不会跳转到个人页 → 也不会立刻写入 `profiles` 表。

2. **新用户在哪里看**
   - **Authentication → Users**：只要调用了 `signUp` 且未报错，新用户会出现在这里（可能显示为未确认）。
   - **Table Editor → `profiles`**：只有在**有 session 时**（即已登录）才会由应用写入；若开启邮箱确认，需用户完成邮件验证并登录后，才会在 `profiles` 里看到对应记录。

## 解决方案

### 方案一：关闭邮箱确认（推荐用于开发/内测）

注册后立即有 session，会跳转到个人资料页，并立刻在 `profiles` 表插入一条记录。

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard) → 你的项目  
2. 左侧 **Authentication** → **Providers** → **Email**  
3. 关闭 **Confirm email**  
4. 保存

### 方案二：保持邮箱确认

- 注册成功后会提示：「请查收邮件并点击链接完成验证，验证后可登录。」  
- 用户点击邮件链接完成验证后，再在登录页用同一邮箱登录，即可进入个人资料页；此时会在 `profiles` 表创建记录（由 `onAuthStateChange` 处理）。

### 方案三：注册时就在数据库有 profile（可选）

若希望即使用户未验证邮箱，也在 **Table Editor → `profiles`** 里看到新注册用户，可以用数据库触发器在 `auth.users` 插入时自动插入 `profiles`：

1. Supabase Dashboard → **SQL Editor**  
2. 执行以下 SQL（若你的 `profiles` 表有不同字段，请按实际表结构修改）：

```sql
-- 当 auth.users 新增用户时，自动在 public.profiles 插入一条记录
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, bio)
  values (
    new.id,
    coalesce(split_part(new.raw_user_meta_data->>'email', '@', 1), '新用户'),
    '新用户，期待发现更多旅行伙伴！'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 绑定到 auth.users 的 insert 事件
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

这样新用户一注册就会在 `profiles` 表有一条记录；前端逻辑不变，用户仍需验证邮箱并登录后才会进入个人页。

## 当前前端行为总结

| 情况           | 行为 |
|----------------|------|
| 未开启邮箱确认 | 注册成功 → 立即跳转个人资料页，并写入 `profiles` |
| 已开启邮箱确认 | 注册成功 → 提示「请查收邮件完成验证」→ 用户点邮件链接后再登录 → 进入个人资料页并写入 `profiles` |
