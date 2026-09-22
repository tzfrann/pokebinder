-- Comprobación segura: no modifica ningún dato.
-- Devuelve una sola fila con el estado de cada pieza del esquema.
with expected_tables(table_name) as (
  values ('profiles'), ('cards'), ('albums'), ('album_cards'), ('friendships'), ('trade_posts')
), existing_tables as (
  select table_name from information_schema.tables
  where table_schema = 'public'
), status as (
  select
    (select count(*) from expected_tables join existing_tables using (table_name)) as table_count,
    exists (
      select 1 from information_schema.triggers
      where event_object_schema = 'auth'
        and event_object_table = 'users'
        and trigger_name = 'on_auth_user_created'
    ) as trigger_exists,
    (select count(*) from pg_policies where schemaname = 'public'
      and tablename in ('profiles', 'cards', 'albums', 'album_cards', 'friendships', 'trade_posts')) as policy_count
)
select
  table_count || ' de 6 tablas' as tablas,
  case when trigger_exists then 'OK' else 'FALTA' end as trigger_perfil,
  policy_count || ' de 21 políticas' as politicas_rls
from status;
