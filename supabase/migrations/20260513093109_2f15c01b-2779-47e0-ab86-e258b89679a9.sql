create type public.request_status as enum (
  'pending', 'reviewing', 'scheduled', 'in_progress', 'delivered', 'completed', 'cancelled'
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1,
  desired_date date,
  delivery_address text,
  phone text,
  notes text,
  status public.request_status not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_requests_user on public.requests(user_id);
create index idx_requests_status on public.requests(status);
create index idx_requests_product on public.requests(product_id);

alter table public.requests enable row level security;

create policy "Users view own requests"
  on public.requests for select to authenticated
  using (auth.uid() = user_id);

create policy "Admins view all requests"
  on public.requests for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users create own requests"
  on public.requests for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users cancel own pending requests"
  on public.requests for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins manage all requests"
  on public.requests for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins delete requests"
  on public.requests for delete to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger requests_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- Status history
create table public.request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  status public.request_status not null,
  comment text,
  actor_id uuid,
  created_at timestamptz not null default now()
);

create index idx_request_events_request on public.request_events(request_id);

alter table public.request_events enable row level security;

create policy "View events of own requests"
  on public.request_events for select to authenticated
  using (
    exists (
      select 1 from public.requests r
      where r.id = request_events.request_id and r.user_id = auth.uid()
    )
  );

create policy "Admins view all events"
  on public.request_events for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins create events"
  on public.request_events for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create initial event when a request is created
create or replace function public.handle_new_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.request_events (request_id, status, comment, actor_id)
  values (new.id, new.status, 'Demande créée', new.user_id);
  return new;
end;
$$;

create trigger on_new_request
  after insert on public.requests
  for each row execute function public.handle_new_request();

-- Auto-create event when admin changes status
create or replace function public.handle_request_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.request_events (request_id, status, comment, actor_id)
    values (new.id, new.status, null, auth.uid());
  end if;
  return new;
end;
$$;

create trigger on_request_status_change
  after update on public.requests
  for each row execute function public.handle_request_status_change();
