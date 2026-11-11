create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- first registered user becomes admin
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_first_admin after insert on auth.users for each row execute function public.handle_first_admin();

-- public site settings
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  show_prices boolean not null default false,
  online_payment_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Anyone reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings(id) values (1);

-- private payment credentials (admin only)
create table public.payment_settings (
  id int primary key default 1 check (id = 1),
  yookassa_shop_id text not null default '',
  yookassa_secret_key text not null default '',
  updated_at timestamptz not null default now()
);
grant select, update on public.payment_settings to authenticated;
grant all on public.payment_settings to service_role;
alter table public.payment_settings enable row level security;
create policy "Admins read payment settings" on public.payment_settings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins update payment settings" on public.payment_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.payment_settings(id) values (1);

-- prices per artwork
create table public.artwork_prices (
  artwork_id text primary key,
  price integer check (price is null or price >= 0),
  updated_at timestamptz not null default now()
);
grant select on public.artwork_prices to anon, authenticated;
grant insert, update, delete on public.artwork_prices to authenticated;
grant all on public.artwork_prices to service_role;
alter table public.artwork_prices enable row level security;
create policy "Anyone reads prices" on public.artwork_prices for select to anon, authenticated using (true);
create policy "Admins manage prices" on public.artwork_prices for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  artwork_id text not null,
  artwork_title text not null,
  method text not null check (method in ('invoice','online')),
  status text not null default 'new' check (status in ('new','awaiting_payment','paid','completed','cancelled')),
  amount integer,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  company text not null default '',
  comment text not null default '',
  payment_id text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Users read own orders" on public.orders for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "Users create own orders" on public.orders for insert to authenticated with check (user_id = auth.uid() and status = 'new' and payment_id is null);
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- which artworks are reserved (no personal data)
create or replace function public.reserved_artworks()
returns setof text language sql stable security definer set search_path = public
as $$ select distinct artwork_id from public.orders where status <> 'cancelled' $$;
grant execute on function public.reserved_artworks() to anon, authenticated;

-- one active order per artwork
create unique index orders_one_active_per_artwork on public.orders(artwork_id) where status <> 'cancelled';