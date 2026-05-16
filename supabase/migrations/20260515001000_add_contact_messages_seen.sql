-- Add read status to contact messages
alter table public.contact_messages
  add column is_seen boolean not null default false;

create policy "Admins can mark contact messages as seen"
  on public.contact_messages for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
