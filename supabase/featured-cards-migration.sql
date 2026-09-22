-- PokéBinder · cartas destacadas del perfil.
-- Permite guardar hasta tres cartas del catálogo en el escaparate personal.
alter table public.profiles
  add column if not exists featured_card_ids text[] not null default '{}';

alter table public.profiles
  drop constraint if exists profiles_featured_card_limit;

alter table public.profiles
  add constraint profiles_featured_card_limit
  check (cardinality(featured_card_ids) <= 3);
