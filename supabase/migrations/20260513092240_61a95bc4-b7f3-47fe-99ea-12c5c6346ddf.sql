-- Enum for product type
create type public.product_type as enum ('pack', 'kit');

-- Products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  type public.product_type not null,
  slug text not null unique,
  title text not null,
  category text not null,
  short_description text,
  description text,
  price_xof integer not null default 0,
  duration_months integer,
  image_url text,
  featured boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_type on public.products(type);
create index idx_products_category on public.products(category);
create index idx_products_published on public.products(published);

alter table public.products enable row level security;

create policy "Anyone can view published products"
  on public.products for select
  using (published = true);

create policy "Admins can view all products"
  on public.products for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert products"
  on public.products for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update products"
  on public.products for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete products"
  on public.products for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Items composing a product
create table public.product_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  quantity numeric,
  unit text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_product_items_product on public.product_items(product_id);

alter table public.product_items enable row level security;

create policy "Anyone can view items of published products"
  on public.product_items for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_items.product_id and p.published = true
    )
  );

create policy "Admins can view all items"
  on public.product_items for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage items"
  on public.product_items for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for product images
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
