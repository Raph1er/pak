-- Add email column to profiles
alter table public.profiles
add column email text;

-- Create index on email
create index idx_profiles_email on public.profiles(email);

-- Update existing profiles with email from auth.users using a trigger context
-- This will be populated when users log in or via the RPC

-- Function to get all users (for admins)
create or replace function public.get_all_users()
returns table (
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.avatar_url,
    p.created_at
  from public.profiles p
  where public.has_role(auth.uid(), 'admin')
  order by p.created_at desc;
$$;

-- Revoke access from public/anon
revoke execute on function public.get_all_users() from public, anon;
grant execute on function public.get_all_users() to authenticated;
