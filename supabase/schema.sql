-- Ejecuta este archivo una vez en Supabase: SQL Editor → New query → pegar → Run.

-- Prendas: una fila por prenda; cada usuario solo ve las suyas.
create table if not exists public.prendas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  nombre text not null default '',
  categoria text not null,
  tipo text not null default '',
  colores text[] not null default '{}',
  temporadas text[] not null default '{}',
  estilos text[] not null default '{}',
  imagen_path text not null,
  original_path text not null,
  creada_en timestamptz not null default now()
);

create index if not exists prendas_user_id_idx on public.prendas (user_id, creada_en desc);

alter table public.prendas enable row level security;

drop policy if exists "Cada usuario gestiona sus prendas" on public.prendas;
create policy "Cada usuario gestiona sus prendas" on public.prendas
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Fotos: bucket privado; cada usuario guarda sus fotos en una carpeta con su id.
insert into storage.buckets (id, name, public)
values ('prendas', 'prendas', false)
on conflict (id) do nothing;

drop policy if exists "Ver fotos propias" on storage.objects;
create policy "Ver fotos propias" on storage.objects
  for select to authenticated
  using (bucket_id = 'prendas' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Subir fotos propias" on storage.objects;
create policy "Subir fotos propias" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'prendas' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Borrar fotos propias" on storage.objects;
create policy "Borrar fotos propias" on storage.objects
  for delete to authenticated
  using (bucket_id = 'prendas' and (storage.foldername(name))[1] = (select auth.uid())::text);
