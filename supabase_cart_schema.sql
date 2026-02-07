-- Create a table to store user carts
create table if not exists public.carts (
  user_id uuid not null primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.carts enable row level security;

-- Policies
create policy "Users can view their own cart" 
on public.carts for select 
using (auth.uid() = user_id);

create policy "Users can insert/update their own cart" 
on public.carts for all 
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- trigger to update updated_at
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
before update on public.carts
for each row
execute procedure public.handle_updated_at();
