-- PokéBinder · catálogo de cartas (inglés) y colección por usuario.
-- Ejecutar después de schema.sql. No elimina las cartas creadas en el prototipo.

create table if not exists public.card_catalog (
  id text primary key,
  name text not null,
  set_code text not null,
  set_name text not null,
  card_number text not null,
  rarity text,
  image_small_url text,
  image_large_url text,
  release_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.user_card_collection (
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_id text not null references public.card_catalog(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 999),
  condition text check (condition in ('mint', 'near_mint', 'excellent', 'good', 'played', 'poor')),
  available_for_trade boolean not null default false,
  notes text check (char_length(notes) <= 500),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id)
);

create index if not exists card_catalog_set_idx on public.card_catalog(set_code);
create index if not exists card_catalog_name_idx on public.card_catalog(name);
create index if not exists user_card_collection_card_idx on public.user_card_collection(card_id);

alter table public.card_catalog enable row level security;
alter table public.user_card_collection enable row level security;

drop policy if exists "Authenticated users can read catalog" on public.card_catalog;
create policy "Authenticated users can read catalog" on public.card_catalog
  for select to authenticated using (true);

drop policy if exists "Owner and friends can read collections" on public.user_card_collection;
create policy "Owner and friends can read collections" on public.user_card_collection
  for select to authenticated using (
    (select auth.uid()) = user_id or public.are_friends((select auth.uid()), user_id)
  );

drop policy if exists "Users add owned cards" on public.user_card_collection;
create policy "Users add owned cards" on public.user_card_collection
  for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists "Users update owned cards" on public.user_card_collection;
create policy "Users update owned cards" on public.user_card_collection
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users remove owned cards" on public.user_card_collection;
create policy "Users remove owned cards" on public.user_card_collection
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select on public.card_catalog to authenticated;
grant select, insert, update, delete on public.user_card_collection to authenticated;
