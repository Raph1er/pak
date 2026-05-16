-- Contact messages table
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text not null,
  subject text not null,
  message text not null,
  product_title text,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can create contact messages"
  on public.contact_messages for insert
  with check (true);

create policy "Users can view own contact messages"
  on public.contact_messages for select to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all contact messages"
  on public.contact_messages for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
