-- PokéBinder · variantes de acabado para XY Base Set.
-- Ejecutar una sola vez después de catalog-migration.sql y seed-xy1.sql.

create table if not exists public.card_variants (
  card_id text not null references public.card_catalog(id) on delete cascade,
  variant_code text not null check (variant_code in ('standard', 'reverse_holo')),
  label text not null,
  sort_order integer not null default 0,
  primary key (card_id, variant_code)
);

-- Todas las cartas tienen su impresión base. La etiqueta refleja si esa
-- impresión base es normal o holo según la checklist oficial.
insert into public.card_variants (card_id, variant_code, label, sort_order)
select
  id,
  'standard',
  case
    when rarity in ('Rare Holo', 'Rare Holo EX', 'Rare Ultra') then 'Holo'
    else 'Standard'
  end,
  1
from public.card_catalog
where set_code = 'xy1'
on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;

-- En XY, las comunes, infrecuentes, raras y raras holo tienen parallel set
-- (reverse holo). Las energías básicas 132-140, EX y Ultra no lo tienen.
insert into public.card_variants (card_id, variant_code, label, sort_order)
select id, 'reverse_holo', 'Reverse Holo', 2
from public.card_catalog
where set_code = 'xy1'
  and rarity in ('Common', 'Uncommon', 'Rare', 'Rare Holo')
  and not (card_number ~ '^[0-9]+$' and card_number::integer between 132 and 140)
on conflict (card_id, variant_code) do update set label = excluded.label, sort_order = excluded.sort_order;

alter table public.card_variants enable row level security;
drop policy if exists "Authenticated users can read card variants" on public.card_variants;
create policy "Authenticated users can read card variants" on public.card_variants
  for select to authenticated using (true);
grant select on public.card_variants to authenticated;

-- Amplía la colección existente. Las cartas marcadas anteriormente quedan
-- asociadas automáticamente a su impresión base.
alter table public.user_card_collection
  add column if not exists variant_code text not null default 'standard';

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.user_card_collection'::regclass
      and conname = 'user_card_collection_pkey'
  ) then
    alter table public.user_card_collection drop constraint user_card_collection_pkey;
  end if;
end $$;

alter table public.user_card_collection
  add primary key (user_id, card_id, variant_code);

alter table public.user_card_collection
  add constraint user_card_collection_variant_fkey
  foreign key (card_id, variant_code)
  references public.card_variants(card_id, variant_code)
  on delete cascade;
