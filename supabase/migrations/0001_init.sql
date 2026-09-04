-- Portulate — esquema inicial
-- Plataforma de candidaturas cívicas para Río Tercero ("mérito y valor").
-- Ejecutar en el SQL Editor de Supabase (o vía CLI). Idempotente donde es posible.

create extension if not exists "pgcrypto";

-- =====================================================================
-- PROFILES  (datos reales del usuario; nombre/apellido usados en referencias)
-- =====================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now()
);

-- Crear el profile automáticamente al registrarse, leyendo el metadata del signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set first_name = excluded.first_name,
        last_name  = excluded.last_name,
        email      = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- POSITIONS  (organigrama fijo, jerárquico)
-- =====================================================================
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  parent_id uuid references public.positions(id) on delete cascade,
  sort_order int not null default 0
);

-- =====================================================================
-- CANDIDACIES  (un usuario se postula a una posición; único por par)
-- =====================================================================
create table if not exists public.candidacies (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.positions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_path text,
  cv_path text,
  cv_name text,
  location_label text,
  location_lat double precision,
  location_lng double precision,
  created_at timestamptz not null default now(),
  unique (position_id, user_id)
);

-- =====================================================================
-- REFERENCES  (texto + valoración a favor/en contra, atribuidas, moderables)
-- =====================================================================
create table if not exists public.candidate_references (
  id uuid primary key default gen_random_uuid(),
  candidacy_id uuid not null references public.candidacies(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) > 0),
  stance text not null check (stance in ('favor', 'contra')),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_references_candidacy on public.candidate_references(candidacy_id);

-- =====================================================================
-- REFERENCE REPORTS  (cualquiera logueado puede reportar; 1 por usuario)
-- =====================================================================
create table if not exists public.reference_reports (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid not null references public.candidate_references(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (reference_id, reporter_id)
);

-- =====================================================================
-- AI SUMMARIES  (resumen pros/contras de referencias visibles)
-- =====================================================================
create table if not exists public.ai_summaries (
  candidacy_id uuid primary key references public.candidacies(id) on delete cascade,
  positive text,
  negative text,
  based_on_count int not null default 0,
  source text not null default 'fallback',   -- 'anthropic' | 'fallback'
  generated_at timestamptz not null default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles              enable row level security;
alter table public.positions             enable row level security;
alter table public.candidacies           enable row level security;
alter table public.candidate_references  enable row level security;
alter table public.reference_reports     enable row level security;
alter table public.ai_summaries          enable row level security;

-- profiles: lectura pública (para mostrar nombre y apellido), gestión del propio
drop policy if exists "profiles public read" on public.profiles;
create policy "profiles public read" on public.profiles for select using (true);
drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

-- positions: solo lectura pública (el seed se carga con service role)
drop policy if exists "positions public read" on public.positions;
create policy "positions public read" on public.positions for select using (true);

-- candidacies: lectura pública; el usuario gestiona las propias
drop policy if exists "candidacies public read" on public.candidacies;
create policy "candidacies public read" on public.candidacies for select using (true);
drop policy if exists "candidacies insert own" on public.candidacies;
create policy "candidacies insert own" on public.candidacies for insert with check (auth.uid() = user_id);
drop policy if exists "candidacies update own" on public.candidacies;
create policy "candidacies update own" on public.candidacies for update using (auth.uid() = user_id);
drop policy if exists "candidacies delete own" on public.candidacies;
create policy "candidacies delete own" on public.candidacies for delete using (auth.uid() = user_id);

-- references: lectura pública SOLO de las visibles (el autor ve las propias);
-- inserta el propio autor. Ocultar se hace con service role (moderación).
drop policy if exists "references public read visible" on public.candidate_references;
create policy "references public read visible" on public.candidate_references
  for select using (hidden = false or auth.uid() = author_id);
drop policy if exists "references insert own" on public.candidate_references;
create policy "references insert own" on public.candidate_references
  for insert with check (auth.uid() = author_id);

-- reports: el usuario inserta y ve los propios
drop policy if exists "reports insert own" on public.reference_reports;
create policy "reports insert own" on public.reference_reports
  for insert with check (auth.uid() = reporter_id);
drop policy if exists "reports read own" on public.reference_reports;
create policy "reports read own" on public.reference_reports
  for select using (auth.uid() = reporter_id);

-- ai summaries: lectura pública (escritura con service role)
drop policy if exists "summaries public read" on public.ai_summaries;
create policy "summaries public read" on public.ai_summaries for select using (true);

-- =====================================================================
-- STORAGE  (foto y CV)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', true)
on conflict (id) do nothing;

-- Lectura pública; el usuario escribe solo en su carpeta (name = "<uid>/...").
drop policy if exists "avatars public read" on storage.objects;
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');
drop policy if exists "avatars user write" on storage.objects;
create policy "avatars user write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars user update" on storage.objects;
create policy "avatars user update" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatars user delete" on storage.objects;
create policy "avatars user delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cvs public read" on storage.objects;
create policy "cvs public read" on storage.objects
  for select using (bucket_id = 'cvs');
drop policy if exists "cvs user write" on storage.objects;
create policy "cvs user write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "cvs user update" on storage.objects;
create policy "cvs user update" on storage.objects
  for update to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "cvs user delete" on storage.objects;
create policy "cvs user delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'cvs' and (storage.foldername(name))[1] = auth.uid()::text);
