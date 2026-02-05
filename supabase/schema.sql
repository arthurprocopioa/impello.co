-- RODE ESSE SQL NO SUPABASE (SQL EDITOR)

create table public.redirects (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  slug text not null,
  message text null,
  destination text null,
  clicks integer not null default 0,
  status text not null default 'ACTIVE',
  events jsonb null default '[]'::jsonb,
  appearance jsonb null default '{"loadingText": "Redirecionando...", "spinnerColor": "emerald"}'::jsonb,
  user_id uuid default auth.uid(), -- Optional: for RLS later
  
  constraint redirects_pkey primary key (id),
  constraint redirects_slug_key unique (slug)
);

-- HABILITAR RLS (Segurança) - Opcional por enquanto, mas recomendado
alter table public.redirects enable row level security;

create policy "Qualquer um pode ler"
on public.redirects
for select
to anon
using (true);

create policy "Qualquer um pode criar/editar (DEV)"
on public.redirects
for all
to anon
using (true);
