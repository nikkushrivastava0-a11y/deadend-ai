-- Custom scrypt accounts are authenticated by the Node backend, not Supabase Auth.
-- No service-role key is needed. A scoped server-only capability gates this RPC.
create schema if not exists deadend_private;
revoke all on schema deadend_private from public, anon, authenticated;
create table deadend_private.backend_keys (hash text primary key check(length(hash)=64));
create table deadend_private.accounts (
 id uuid primary key default gen_random_uuid(), username text unique not null check(username ~ '^[a-z0-9_-]{3,40}$'),
 salt text not null check(length(salt)=32), password_hash text not null check(length(password_hash)=128), created_at timestamptz not null default now()
);
create table deadend_private.sessions (
 hash text primary key check(length(hash)=64), account_id uuid not null references deadend_private.accounts on delete cascade,
 expires_at timestamptz not null default now()+interval '8 hours'
);
create index on deadend_private.sessions(account_id);
create table deadend_private.workspaces (
 id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 1 and 100),
 data jsonb not null default '{"sources":[],"claims":[],"events":[]}', version bigint not null default 0,
 created_at timestamptz not null default now(), check(octet_length(data::text)<1000000)
);
create table deadend_private.members (
 workspace_id uuid references deadend_private.workspaces on delete cascade, account_id uuid references deadend_private.accounts on delete cascade,
 role text not null check(role in ('owner','reviewer','recipient')), primary key(workspace_id,account_id)
);
create index on deadend_private.members(account_id);
create table deadend_private.invites (
 hash text primary key check(length(hash)=64), workspace_id uuid not null references deadend_private.workspaces on delete cascade,
 role text not null check(role in ('reviewer','recipient')), expires_at timestamptz not null default now()+interval '1 day', used_by uuid references deadend_private.accounts
);
create index on deadend_private.invites(workspace_id);
create index on deadend_private.invites(used_by);
create table deadend_private.limits (key text primary key, bucket bigint not null, attempts integer not null);
alter table deadend_private.backend_keys enable row level security;
alter table deadend_private.accounts enable row level security;
alter table deadend_private.sessions enable row level security;
alter table deadend_private.workspaces enable row level security;
alter table deadend_private.members enable row level security;
alter table deadend_private.invites enable row level security;
alter table deadend_private.limits enable row level security;
revoke all on all tables in schema deadend_private from public,anon,authenticated;

create function deadend_private.gateway(p_secret text,p_action text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare a uuid; w uuid; r text; result jsonb; n integer; b bigint; inv deadend_private.invites; created uuid;
begin
 if p_secret is null or length(p_secret)<48 or not exists(select 1 from deadend_private.backend_keys where hash=encode(sha256(convert_to(p_secret,'UTF8')),'hex')) then
  raise exception using message='Backend access denied',errcode='42501';
 end if;
 if p_action='rate' then
  b:=floor(extract(epoch from now())/900)::bigint;
  insert into deadend_private.limits(key,bucket,attempts) values(p_payload->>'key',b,1)
  on conflict(key) do update set bucket=b,attempts=case when deadend_private.limits.bucket=b then deadend_private.limits.attempts+1 else 1 end
  returning attempts into n;
  return jsonb_build_object('allowed',n<=20);
 end if;
 if p_action='register' then
  insert into deadend_private.accounts(username,salt,password_hash) values(p_payload->>'username',p_payload->>'salt',p_payload->>'passwordHash') returning id into a;
  return jsonb_build_object('id',a,'username',p_payload->>'username');
 end if;
 if p_action='login-info' then
  select jsonb_build_object('id',id,'username',username,'salt',salt,'passwordHash',password_hash) into result from deadend_private.accounts where username=p_payload->>'username';
  return result;
 end if;
 if p_action='session-create' then
  delete from deadend_private.sessions where expires_at<now();
  insert into deadend_private.sessions(hash,account_id) values(p_payload->>'hash',(p_payload->>'accountId')::uuid);
  return '{"ok":true}'::jsonb;
 end if;
 select account_id into a from deadend_private.sessions where hash=p_payload->>'sessionHash' and expires_at>now();
 if a is null then raise exception using message='Sign in required',errcode='28000';end if;
 if p_action='session-delete' then
  delete from deadend_private.sessions where hash=p_payload->>'sessionHash';return '{"ok":true}'::jsonb;
 end if;
 if p_action='session-read' then
  select jsonb_build_object('id',id,'username',username) into result from deadend_private.accounts where id=a;return result;
 end if;
 if p_action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'name',x.name,'role',m.role) order by x.created_at),'[]') into result
  from deadend_private.workspaces x join deadend_private.members m on m.workspace_id=x.id where m.account_id=a;return result;
 end if;
 if p_action='create' then
  if (select count(*) from deadend_private.members where account_id=a and role='owner')>=5 then raise exception 'Workspace limit reached';end if;
  insert into deadend_private.workspaces(name) values(p_payload->>'name') returning id into created;
  insert into deadend_private.members values(created,a,'owner');return jsonb_build_object('id',created);
 end if;
 if p_action='join' then
  select * into inv from deadend_private.invites where hash=p_payload->>'inviteHash' for update;
  if inv.hash is null or inv.expires_at<now() or inv.used_by is not null then raise exception using message='Invitation invalid, expired or already used',errcode='42501';end if;
  if (select count(*) from deadend_private.members where workspace_id=inv.workspace_id)>=12 then raise exception 'Member limit reached';end if;
  insert into deadend_private.members values(inv.workspace_id,a,inv.role);
  update deadend_private.invites set used_by=a where hash=inv.hash;return jsonb_build_object('id',inv.workspace_id);
 end if;
 w:=(p_payload->>'workspaceId')::uuid;
 select role into r from deadend_private.members where workspace_id=w and account_id=a;
 if r is null then raise exception using message='Workspace not found',errcode='42501';end if;
 if p_action='read' then
  select jsonb_build_object('id',x.id,'name',x.name,'db',x.data,'version',x.version,'role',r,'username',u.username,
   'members',(select jsonb_agg(jsonb_build_object('username',aa.username,'role',mm.role)) from deadend_private.members mm join deadend_private.accounts aa on aa.id=mm.account_id where mm.workspace_id=w))
  into result from deadend_private.workspaces x,deadend_private.accounts u where x.id=w and u.id=a;return result;
 end if;
 if p_action='save' then
  -- Backend validates the action and applies role-aware filtering. Clients cannot call this RPC without the capability.
  update deadend_private.workspaces set data=p_payload->'db',version=version+1 where id=w and version=(p_payload->>'version')::bigint returning version into n;
  if n is null then raise exception using message='Workspace changed. Refresh and retry.',errcode='40001';end if;
  return jsonb_build_object('version',n);
 end if;
 if p_action='invite' then
  if r<>'owner' then raise exception using message='Only owners can invite',errcode='42501';end if;
  insert into deadend_private.invites(hash,workspace_id,role) values(p_payload->>'inviteHash',w,p_payload->>'role');return '{"ok":true}'::jsonb;
 end if;
 raise exception 'Unknown backend action';
end $$;
revoke all on function deadend_private.gateway(text,text,jsonb) from public,anon,authenticated;
-- Public wrapper is an invoker. Private implementation is the only privilege elevation,
-- validates a server capability before any operation and accepts no arbitrary SQL.
grant usage on schema deadend_private to anon;
grant execute on function deadend_private.gateway(text,text,jsonb) to anon;
create function public.deadend_gateway(p_secret text,p_action text,p_payload jsonb) returns jsonb
language sql security invoker set search_path='' as $$ select deadend_private.gateway(p_secret,p_action,p_payload); $$;
revoke all on function public.deadend_gateway(text,text,jsonb) from public,anon,authenticated;
grant execute on function public.deadend_gateway(text,text,jsonb) to anon;
