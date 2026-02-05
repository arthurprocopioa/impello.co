-- SCRIPT CORRIGIDO (Use este se houver erro de tabela já existente)

-- 1. SETTINGS
create table if not exists public.settings (
  id uuid not null default gen_random_uuid (),
  user_id uuid default auth.uid(),
  meta_pixel_id text,
  meta_capi_token text,
  google_conversion_id text,
  google_conversion_label text,
  evolution_api_url text,
  evolution_api_key text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  constraint settings_pkey primary key (id),
  constraint settings_user_id_key unique (user_id)
);

-- 2. CONTACTS (Se já existir, não falha)
create table if not exists public.contacts (
  id uuid not null default gen_random_uuid (),
  user_id uuid default auth.uid(),
  name text,
  phone text not null,
  last_source text default 'DIRECT',
  funnel_status text default 'OPEN',
  profile_pic text,
  created_at timestamp with time zone default now(),
  last_interaction_at timestamp with time zone default now(),

  constraint contacts_pkey primary key (id)
);

-- Garantir que as colunas necessárias existam em CONTACTS (caso a tabela antiga seja diferente)
do $$ 
begin
    if not exists (select 1 from information_schema.columns where table_name='contacts' and column_name='last_source') then
        alter table public.contacts add column last_source text default 'DIRECT';
    end if;
    if not exists (select 1 from information_schema.columns where table_name='contacts' and column_name='funnel_status') then
        alter table public.contacts add column funnel_status text default 'OPEN';
    end if;
    if not exists (select 1 from information_schema.columns where table_name='contacts' and column_name='last_interaction_at') then
        alter table public.contacts add column last_interaction_at timestamp with time zone default now();
    end if;
end $$;


-- 3. MESSAGES
create table if not exists public.messages (
  id uuid not null default gen_random_uuid (),
  contact_id uuid references public.contacts(id) on delete cascade,
  direction text not null check (direction in ('IN', 'OUT')),
  content text,
  status text default 'SENT',
  type text default 'TEXT',
  created_at timestamp with time zone default now(),

  constraint messages_pkey primary key (id)
);

-- 4. POLICIES (Segurança - Remove antigas se existirem e recria)
do $$ begin
  drop policy if exists "Users can manage their own settings" on public.settings;
  drop policy if exists "Users can manage their own contacts" on public.contacts;
  drop policy if exists "Users can manage messages for their contacts" on public.messages;
end $$;

alter table public.settings enable row level security;
alter table public.contacts enable row level security;
alter table public.messages enable row level security;

create policy "Users can manage their own settings" on public.settings
  for all using (auth.uid() = user_id);

create policy "Users can manage their own contacts" on public.contacts
  for all using (auth.uid() = user_id);

create policy "Users can manage messages for their contacts" on public.messages
  for all using (
    exists (
      select 1 from public.contacts
      where contacts.id = messages.contact_id
      and contacts.user_id = auth.uid()
    )
  );
