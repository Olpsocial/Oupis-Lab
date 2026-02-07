-- Copy đoạn SQL này vào Supabase > SQL Editor để tạo bảng lưu chat

create table if not exists public.chat_history (
  id uuid default gen_random_uuid() primary key,
  session_id text not null, -- Mã phiên chat (mỗi lần F5 là 1 phiên mới)
  role text not null check (role in ('user', 'assistant')), -- Ai chat?
  content text not null, -- Nội dung chat
  created_at timestamptz default now() -- Thời gian
);

-- Bật Row Level Security (RLS) để an toàn
alter table public.chat_history enable row level security;

-- Cho phép ai cũng được INSERT (lưu tin nhắn)
create policy "Allow anonymous insert"
on public.chat_history
for insert
to anon
with check (true);

-- Cho phép ai cũng được SELECT (xem lại tin nhắn của chính session đó - nếu cần)
-- Ở đây tạm mở cho anon select, thực tế có thể filter theo session_id ở phía client
create policy "Allow anonymous select"
on public.chat_history
for select
to anon
using (true);
