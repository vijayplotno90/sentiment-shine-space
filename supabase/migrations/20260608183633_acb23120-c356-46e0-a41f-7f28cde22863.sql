
-- ========== ENUM ==========
do $$ begin
  create type public.app_role as enum ('owner','admin','ca');
exception when duplicate_object then null; end $$;

-- ========== updated_at helper ==========
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- ========== ORGANIZATIONS ==========
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Company',
  owner_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.organizations to authenticated;
grant all on public.organizations to service_role;

-- ========== MEMBERS ==========
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null,
  email text,
  role public.app_role not null default 'admin',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
grant select, insert, update, delete on public.organization_members to authenticated;
grant all on public.organization_members to service_role;

-- ========== INVITATIONS ==========
create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role public.app_role not null default 'admin',
  status text not null default 'pending',
  invited_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);
grant select, insert, update, delete on public.organization_invitations to authenticated;
grant all on public.organization_invitations to service_role;

-- ========== SECURITY DEFINER HELPERS ==========
create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.organization_members
  where user_id = auth.uid() and status = 'active'
  order by created_at limit 1
$$;

create or replace function public.is_active_member(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.organization_members
    where organization_id = _org and user_id = auth.uid() and status = 'active')
$$;

create or replace function public.is_org_manager(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.organization_members
    where organization_id = _org and user_id = auth.uid() and status = 'active'
      and role in ('owner','admin'))
$$;

create or replace function public.is_org_owner(_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.organization_members
    where organization_id = _org and user_id = auth.uid() and status = 'active'
      and role = 'owner')
$$;

create or replace function public.shares_my_org(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from public.organization_members m1
    join public.organization_members m2 on m1.organization_id = m2.organization_id
    where m1.user_id = auth.uid() and m1.status = 'active' and m2.user_id = _user_id)
$$;

-- ========== RLS + POLICIES: org tables ==========
alter table public.organizations enable row level security;
create policy "members read their org" on public.organizations
  for select to authenticated using (public.is_active_member(id));
create policy "owner inserts org" on public.organizations
  for insert to authenticated with check (owner_id = auth.uid());
create policy "owner updates org" on public.organizations
  for update to authenticated using (public.is_org_owner(id)) with check (public.is_org_owner(id));
create policy "owner deletes org" on public.organizations
  for delete to authenticated using (public.is_org_owner(id));

alter table public.organization_members enable row level security;
create policy "members read teammates" on public.organization_members
  for select to authenticated using (public.is_active_member(organization_id));
create policy "owner adds members" on public.organization_members
  for insert to authenticated with check (public.is_org_owner(organization_id));
create policy "owner updates members" on public.organization_members
  for update to authenticated using (public.is_org_owner(organization_id)) with check (public.is_org_owner(organization_id));
create policy "owner deletes members" on public.organization_members
  for delete to authenticated using (public.is_org_owner(organization_id));

alter table public.organization_invitations enable row level security;
create policy "owner reads invites" on public.organization_invitations
  for select to authenticated using (public.is_org_owner(organization_id));
create policy "owner creates invites" on public.organization_invitations
  for insert to authenticated with check (public.is_org_owner(organization_id));
create policy "owner updates invites" on public.organization_invitations
  for update to authenticated using (public.is_org_owner(organization_id)) with check (public.is_org_owner(organization_id));
create policy "owner deletes invites" on public.organization_invitations
  for delete to authenticated using (public.is_org_owner(organization_id));

create trigger trg_org_updated before update on public.organizations
  for each row execute function public.update_updated_at_column();
create trigger trg_member_updated before update on public.organization_members
  for each row execute function public.update_updated_at_column();
create trigger trg_invite_updated before update on public.organization_invitations
  for each row execute function public.update_updated_at_column();

-- ========== BACKFILL ORGS FROM EXISTING DATA ==========
insert into public.organizations (name, owner_id)
select coalesce((select p.name from public.profiles p where p.user_id = u.uid limit 1), 'My Company'), u.uid
from (
  select user_id as uid from public.profiles
  union select user_id from public.clients
  union select user_id from public.developers
  union select user_id from public.projects
  union select user_id from public.meetings
  union select user_id from public.invoices
  union select user_id from public.invoice_line_items
  union select user_id from public.receipts
  union select user_id from public.expenses
  union select user_id from public.payments
  union select user_id from public.tax_settings
) u
where u.uid is not null
  and not exists (select 1 from public.organizations o where o.owner_id = u.uid);

insert into public.organization_members (organization_id, user_id, email, role, status)
select o.id, o.owner_id, p.email, 'owner', 'active'
from public.organizations o
left join public.profiles p on p.user_id = o.owner_id
where not exists (
  select 1 from public.organization_members m
  where m.organization_id = o.id and m.user_id = o.owner_id);

-- ========== ADD organization_id TO DATA TABLES ==========
do $$
declare t text;
begin
  foreach t in array array['clients','developers','projects','meetings','invoices','invoice_line_items','receipts','expenses','payments','tax_settings']
  loop
    execute format('alter table public.%I add column if not exists organization_id uuid', t);
    execute format('update public.%I x set organization_id = o.id from public.organizations o where o.owner_id = x.user_id and x.organization_id is null', t);
    execute format('alter table public.%I alter column organization_id set not null', t);
    execute format('alter table public.%I alter column organization_id set default public.current_org_id()', t);
    execute format('alter table public.%I add constraint %I foreign key (organization_id) references public.organizations(id) on delete cascade', t, t||'_org_fk');
  end loop;
end$$;

-- ========== DROP OLD PER-USER POLICIES ==========
drop policy if exists "Users manage own clients" on public.clients;
drop policy if exists "Users manage own developers" on public.developers;
drop policy if exists "Users manage own projects" on public.projects;
drop policy if exists "Users manage own meetings" on public.meetings;
drop policy if exists "Users manage own invoices" on public.invoices;
drop policy if exists "Users manage own line items" on public.invoice_line_items;
drop policy if exists "Users manage own receipts" on public.receipts;
drop policy if exists "Users manage own expenses" on public.expenses;
drop policy if exists "Users manage own payments" on public.payments;
drop policy if exists "Users manage own tax settings" on public.tax_settings;
drop policy if exists "Users manage own profile" on public.profiles;

-- ========== NEW ORG-BASED POLICIES ==========
-- Shared-read tables (managers + CA can read; only managers write)
-- clients
create policy "org read clients" on public.clients for select to authenticated using (public.is_active_member(organization_id));
create policy "mgr write clients ins" on public.clients for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write clients upd" on public.clients for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write clients del" on public.clients for delete to authenticated using (public.is_org_manager(organization_id));
-- invoices
create policy "org read invoices" on public.invoices for select to authenticated using (public.is_active_member(organization_id));
create policy "mgr write invoices ins" on public.invoices for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write invoices upd" on public.invoices for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write invoices del" on public.invoices for delete to authenticated using (public.is_org_manager(organization_id));
-- invoice_line_items
create policy "org read line items" on public.invoice_line_items for select to authenticated using (public.is_active_member(organization_id));
create policy "mgr write line items ins" on public.invoice_line_items for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write line items upd" on public.invoice_line_items for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write line items del" on public.invoice_line_items for delete to authenticated using (public.is_org_manager(organization_id));
-- receipts
create policy "org read receipts" on public.receipts for select to authenticated using (public.is_active_member(organization_id));
create policy "mgr write receipts ins" on public.receipts for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write receipts upd" on public.receipts for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write receipts del" on public.receipts for delete to authenticated using (public.is_org_manager(organization_id));

-- Manager-only tables (CA cannot read)
-- developers
create policy "mgr read developers" on public.developers for select to authenticated using (public.is_org_manager(organization_id));
create policy "mgr write developers ins" on public.developers for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write developers upd" on public.developers for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write developers del" on public.developers for delete to authenticated using (public.is_org_manager(organization_id));
-- projects
create policy "mgr read projects" on public.projects for select to authenticated using (public.is_org_manager(organization_id));
create policy "mgr write projects ins" on public.projects for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write projects upd" on public.projects for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write projects del" on public.projects for delete to authenticated using (public.is_org_manager(organization_id));
-- meetings
create policy "mgr read meetings" on public.meetings for select to authenticated using (public.is_org_manager(organization_id));
create policy "mgr write meetings ins" on public.meetings for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write meetings upd" on public.meetings for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write meetings del" on public.meetings for delete to authenticated using (public.is_org_manager(organization_id));
-- expenses
create policy "mgr read expenses" on public.expenses for select to authenticated using (public.is_org_manager(organization_id));
create policy "mgr write expenses ins" on public.expenses for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write expenses upd" on public.expenses for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write expenses del" on public.expenses for delete to authenticated using (public.is_org_manager(organization_id));
-- payments
create policy "mgr read payments" on public.payments for select to authenticated using (public.is_org_manager(organization_id));
create policy "mgr write payments ins" on public.payments for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write payments upd" on public.payments for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write payments del" on public.payments for delete to authenticated using (public.is_org_manager(organization_id));
-- tax_settings
create policy "mgr read tax" on public.tax_settings for select to authenticated using (public.is_org_manager(organization_id));
create policy "mgr write tax ins" on public.tax_settings for insert to authenticated with check (public.is_org_manager(organization_id));
create policy "mgr write tax upd" on public.tax_settings for update to authenticated using (public.is_org_manager(organization_id)) with check (public.is_org_manager(organization_id));
create policy "mgr write tax del" on public.tax_settings for delete to authenticated using (public.is_org_manager(organization_id));

-- tax_settings: one row per organization
alter table public.tax_settings drop constraint if exists tax_settings_user_id_key;
create unique index if not exists tax_settings_org_unique on public.tax_settings(organization_id);

-- profiles: own + teammates readable
create policy "read own or teammate profile" on public.profiles for select to authenticated using (auth.uid() = user_id or public.shares_my_org(user_id));
create policy "insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ========== SIGN-UP: create org or join via invite ==========
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare inv record; new_org uuid;
begin
  insert into public.profiles (user_id, name, email, initials)
  values (NEW.id,
    coalesce(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    upper(left(coalesce(NEW.raw_user_meta_data->>'name', NEW.email),2)));

  select * into inv from public.organization_invitations
   where lower(email) = lower(NEW.email) and status = 'pending'
   order by created_at desc limit 1;

  if inv.id is not null then
    insert into public.organization_members (organization_id, user_id, email, role, status)
    values (inv.organization_id, NEW.id, NEW.email, inv.role, 'active')
    on conflict (organization_id, user_id) do update set status = 'active', role = excluded.role;
    update public.organization_invitations set status = 'accepted', updated_at = now() where id = inv.id;
  else
    insert into public.organizations (name, owner_id)
    values (coalesce(NEW.raw_user_meta_data->>'name','My') || '''s Company', NEW.id)
    returning id into new_org;
    insert into public.organization_members (organization_id, user_id, email, role, status)
    values (new_org, NEW.id, NEW.email, 'owner', 'active');
  end if;
  return NEW;
end;
$$;

-- ========== ACCEPT INVITES FOR EXISTING USERS (called on login) ==========
create or replace function public.accept_pending_invitations()
returns void language plpgsql security definer set search_path = public as $$
declare inv record; uemail text;
begin
  select email into uemail from auth.users where id = auth.uid();
  if uemail is null then return; end if;
  for inv in select * from public.organization_invitations
     where lower(email) = lower(uemail) and status = 'pending' loop
    insert into public.organization_members (organization_id, user_id, email, role, status)
    values (inv.organization_id, auth.uid(), uemail, inv.role, 'active')
    on conflict (organization_id, user_id) do update set status = 'active', role = excluded.role;
    update public.organization_invitations set status = 'accepted', updated_at = now() where id = inv.id;
  end loop;
end;
$$;
