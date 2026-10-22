-- VisaMOTion production document suite, CMS and direct chat foundation.
-- Apply this migration in the connected Supabase project before production launch.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.visamotion_countries (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  slug text not null unique,
  name text not null,
  region text not null,
  flag_path text,
  cover_path text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visamotion_documents (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.visamotion_countries(id) on delete cascade,
  external_code text not null unique,
  title text not null,
  description text,
  document_type text not null default 'visa',
  storage_path text not null,
  sample_storage_path text,
  mime_type text not null default 'application/pdf',
  file_size bigint,
  page_count integer,
  field_count integer not null default 0,
  tags jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visamotion_homepage_cards (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  body text,
  image_path text,
  link_type text not null default 'none',
  link_value text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.visamotion_blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null default '',
  cover_path text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  author_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep the existing chat tables compatible with the current app and add direct-chat controls.
alter table if exists public.chat_threads add column if not exists assigned_admin_id uuid references auth.users(id) on delete set null;
alter table if exists public.chat_threads add column if not exists status text not null default 'open' check (status in ('open', 'closed'));
alter table if exists public.chat_messages add column if not exists sender_role text not null default 'user' check (sender_role in ('user', 'admin', 'assistant'));
alter table if exists public.chat_messages add column if not exists read_at timestamptz;

create table if not exists public.visamotion_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists visamotion_documents_country_idx on public.visamotion_documents(country_id, sort_order);
create index if not exists visamotion_blog_status_idx on public.visamotion_blog_posts(status, published_at desc);
create index if not exists visamotion_audit_created_idx on public.visamotion_audit_events(created_at desc);

alter table public.profiles enable row level security;
alter table public.visamotion_countries enable row level security;
alter table public.visamotion_documents enable row level security;
alter table public.visamotion_homepage_cards enable row level security;
alter table public.visamotion_blog_posts enable row level security;
alter table public.visamotion_audit_events enable row level security;

-- Drop/recreate only policies owned by this migration so it is safe to re-run.
drop policy if exists profiles_self_read on public.profiles;
drop policy if exists profiles_admin_read on public.profiles;
drop policy if exists profiles_self_update on public.profiles;
drop policy if exists countries_published_read on public.visamotion_countries;
drop policy if exists countries_admin_all on public.visamotion_countries;
drop policy if exists documents_published_read on public.visamotion_documents;
drop policy if exists documents_admin_all on public.visamotion_documents;
drop policy if exists homepage_published_read on public.visamotion_homepage_cards;
drop policy if exists homepage_admin_all on public.visamotion_homepage_cards;
drop policy if exists blog_published_read on public.visamotion_blog_posts;
drop policy if exists blog_admin_all on public.visamotion_blog_posts;
drop policy if exists audit_admin_read on public.visamotion_audit_events;

create policy profiles_self_read on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_admin_read on public.profiles for select to authenticated using (public.is_admin());
create policy profiles_self_update on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy countries_published_read on public.visamotion_countries for select to authenticated using (is_published or public.is_admin());
create policy countries_admin_all on public.visamotion_countries for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy documents_published_read on public.visamotion_documents for select to authenticated using (
  public.is_admin() or (is_published and exists (select 1 from public.visamotion_countries c where c.id = country_id and c.is_published))
);
create policy documents_admin_all on public.visamotion_documents for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy homepage_published_read on public.visamotion_homepage_cards for select to authenticated using (is_published or public.is_admin());
create policy homepage_admin_all on public.visamotion_homepage_cards for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy blog_published_read on public.visamotion_blog_posts for select to authenticated using (status = 'published' or public.is_admin());
create policy blog_admin_all on public.visamotion_blog_posts for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy audit_admin_read on public.visamotion_audit_events for select to authenticated using (public.is_admin());

-- Only admins can write audit records from the browser; server-side service-role writes remain available.
create policy audit_admin_insert on public.visamotion_audit_events for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

-- Storage bucket is private; viewers receive signed URLs from the application.
insert into storage.buckets (id, name, public)
values ('visamotion-documents', 'visamotion-documents', false)
on conflict (id) do update set public = false;

 drop policy if exists visamotion_storage_read on storage.objects;
 drop policy if exists visamotion_storage_admin_insert on storage.objects;
 drop policy if exists visamotion_storage_admin_update on storage.objects;
 drop policy if exists visamotion_storage_admin_delete on storage.objects;

create policy visamotion_storage_read on storage.objects for select to authenticated using (
  bucket_id = 'visamotion-documents' and (public.is_admin() or exists (
    select 1 from public.visamotion_documents d
    join public.visamotion_countries c on c.id = d.country_id
    where d.storage_path = name and d.is_published and c.is_published
  ))
);
create policy visamotion_storage_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'visamotion-documents' and public.is_admin());
create policy visamotion_storage_admin_update on storage.objects for update to authenticated using (bucket_id = 'visamotion-documents' and public.is_admin()) with check (bucket_id = 'visamotion-documents' and public.is_admin());
create policy visamotion_storage_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'visamotion-documents' and public.is_admin());

-- Prevent clients from escalating roles.
revoke update (role) on public.profiles from authenticated;
