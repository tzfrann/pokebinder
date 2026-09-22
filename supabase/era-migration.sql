-- Jerarquía de catálogo: Era → Set → Carta.
create table if not exists public.card_eras (
  id text primary key,
  name text not null unique,
  sort_order integer not null unique check (sort_order >= 0)
);

create table if not exists public.card_sets (
  id text primary key,
  era_id text not null references public.card_eras(id) on delete restrict,
  name text not null,
  printed_total integer not null check (printed_total > 0),
  release_date date,
  logo_url text,
  sort_order integer not null default 0 check (sort_order >= 0)
);

create index if not exists card_sets_era_idx on public.card_sets(era_id, sort_order);

alter table public.card_eras enable row level security;
alter table public.card_sets enable row level security;

drop policy if exists "Authenticated users can read eras" on public.card_eras;
create policy "Authenticated users can read eras" on public.card_eras for select to authenticated using (true);
drop policy if exists "Authenticated users can read sets" on public.card_sets;
create policy "Authenticated users can read sets" on public.card_sets for select to authenticated using (true);

grant select on public.card_eras, public.card_sets to authenticated;
