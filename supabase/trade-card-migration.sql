-- PokéBinder · vincula cada anuncio nuevo a una carta y variante exactas.
-- Ejecutar una vez después de schema.sql, catalog-migration.sql y variant-migration.sql.
-- Los anuncios antiguos se conservan y siguen visibles sin carta vinculada.

alter table public.trade_posts
  add column if not exists card_id text,
  add column if not exists variant_code text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.trade_posts'::regclass
      and conname = 'trade_posts_card_variant_fkey'
  ) then
    alter table public.trade_posts
      add constraint trade_posts_card_variant_fkey
      foreign key (card_id, variant_code)
      references public.card_variants(card_id, variant_code);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.trade_posts'::regclass
      and conname = 'trade_posts_card_pair_check'
  ) then
    alter table public.trade_posts
      add constraint trade_posts_card_pair_check
      check ((card_id is null) = (variant_code is null));
  end if;
end $$;

create index if not exists trade_posts_card_variant_idx
  on public.trade_posts(card_id, variant_code)
  where status = 'active';

notify pgrst, 'reload schema';
