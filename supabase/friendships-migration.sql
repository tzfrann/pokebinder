-- PokéBinder · evita solicitudes duplicadas en direcciones opuestas.
-- Ejecutar una vez antes de probar el sistema de amigos.
create unique index if not exists friendships_unique_pair_idx
on public.friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);
