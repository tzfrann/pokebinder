-- PokéBinder · esquema inicial para Supabase
-- Ejecuta este archivo completo en: Supabase > SQL Editor > New query.

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 30),
  avatar_color text not null default '#ffd255',
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  card_name text not null check (char_length(card_name) between 1 and 100),
  set_name text not null check (char_length(set_name) between 1 and 100),
  card_number text not null check (char_length(card_number) between 1 and 30),
  rarity text not null default 'Rare',
  quantity integer not null default 1 check (quantity > 0 and quantity <= 999),
  notes text check (char_length(notes) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 60),
  description text check (char_length(description) <= 300),
  visibility text not null default 'friends' check (visibility in ('private', 'friends')),
  cover_style text not null default 'purple' check (cover_style in ('purple', 'teal', 'gold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.album_cards (
  album_id uuid not null references public.albums(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  primary key (album_id, card_id)
);

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  unique (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);

create table public.trade_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('sell', 'want', 'trade')),
  title text not null check (char_length(title) between 3 and 100),
  description text check (char_length(description) <= 500),
  price_cents integer check (price_cents >= 0),
  status text not null default 'active' check (status in ('active', 'closed')),
  created_at timestamptz not null default now()
);

create index cards_user_id_idx on public.cards(user_id);
create index albums_user_id_idx on public.albums(user_id);
create index trade_posts_user_id_idx on public.trade_posts(user_id);

-- Comprueba si dos perfiles son amigos sin exponer toda la tabla de relaciones.
create or replace function public.are_friends(first_user uuid, second_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((requester_id = first_user and addressee_id = second_user)
        or (requester_id = second_user and addressee_id = first_user))
  );
$$;

-- Crea el perfil al aceptar una invitación enviada desde Supabase Auth.
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.cards enable row level security;
alter table public.albums enable row level security;
alter table public.album_cards enable row level security;
alter table public.friendships enable row level security;
alter table public.trade_posts enable row level security;

-- Perfiles: los usuarios conectados pueden descubrir a sus amigos; todos editan solo el suyo.
create policy "Authenticated users can read profiles" on public.profiles for select to authenticated using (true);
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Cartas: el propietario gestiona las suyas; los amigos pueden verlas.
create policy "Owner and friends can read cards" on public.cards for select to authenticated using (
  (select auth.uid()) = user_id or public.are_friends((select auth.uid()), user_id)
);
create policy "Users insert own cards" on public.cards for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own cards" on public.cards for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own cards" on public.cards for delete to authenticated using ((select auth.uid()) = user_id);

-- Álbumes: un álbum privado es solo del dueño; uno de amigos se comparte con amistades aceptadas.
create policy "Owner and friends read visible albums" on public.albums for select to authenticated using (
  (select auth.uid()) = user_id
  or (visibility = 'friends' and public.are_friends((select auth.uid()), user_id))
);
create policy "Users insert own albums" on public.albums for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own albums" on public.albums for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own albums" on public.albums for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Can read cards in visible albums" on public.album_cards for select to authenticated using (
  exists (select 1 from public.albums where albums.id = album_id and (
    albums.user_id = (select auth.uid())
    or (albums.visibility = 'friends' and public.are_friends((select auth.uid()), albums.user_id))
  ))
);
create policy "Owner manages album cards" on public.album_cards for insert to authenticated with check (
  exists (select 1 from public.albums where albums.id = album_id and albums.user_id = (select auth.uid()))
);
create policy "Owner removes album cards" on public.album_cards for delete to authenticated using (
  exists (select 1 from public.albums where albums.id = album_id and albums.user_id = (select auth.uid()))
);

-- Amistades: solo los participantes ven o responden a la solicitud.
create policy "Participants read friendships" on public.friendships for select to authenticated using (
  (select auth.uid()) in (requester_id, addressee_id)
);
create policy "Users send friendship requests" on public.friendships for insert to authenticated with check ((select auth.uid()) = requester_id);
create policy "Addressee accepts friendships" on public.friendships for update to authenticated using ((select auth.uid()) = addressee_id) with check ((select auth.uid()) = addressee_id);
create policy "Participants delete friendships" on public.friendships for delete to authenticated using ((select auth.uid()) in (requester_id, addressee_id));

-- Trades: solo se ven entre amigos y el propietario los administra.
create policy "Friends can read trades" on public.trade_posts for select to authenticated using (
  (select auth.uid()) = user_id or public.are_friends((select auth.uid()), user_id)
);
create policy "Users insert own trades" on public.trade_posts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own trades" on public.trade_posts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own trades" on public.trade_posts for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.cards, public.albums, public.album_cards, public.friendships, public.trade_posts to authenticated;
