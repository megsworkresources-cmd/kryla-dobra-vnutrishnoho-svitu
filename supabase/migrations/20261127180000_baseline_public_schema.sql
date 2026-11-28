-- Baseline of the deployed Supabase schema.
--
-- Until now every object in this project was created by hand in the dashboard or
-- the SQL editor, so the row level security policies and the RPCs (grow_sunflower,
-- delete_my_account, read_shared_sunflowers, read_public_sunflower_stages,
-- publish_sunflower) existed only in the live database. This file records them.
--
-- It is written to converge an existing project as well as build an empty one:
-- tables are created only when missing, columns are added when missing, policies
-- are dropped and recreated, and functions are replaced. Replaying it is therefore
-- safe, and `supabase db push` against the project that already has these objects
-- reproduces the same state instead of failing.
--
-- What this schema deliberately does not contain: child identity, drawings,
-- feelings or activity records. The device store owns those. The only shared row
-- is a caregiver-owned, anonymous sunflower stage.
--
-- Verify the deployed database still matches this file with:
--   SUPABASE_DB_URL=... bun run db:drift

begin;

-- Public reads (the children's community garden) need the schema, nothing else.
grant usage on schema public to anon, authenticated;

-- ---------------------------------------------------------------------------
-- shared_sunflowers: one anonymous, caregiver-owned sunflower per account.
-- ---------------------------------------------------------------------------
create table if not exists public.shared_sunflowers (
  owner_id uuid primary key,
  flower_id uuid not null default gen_random_uuid() unique,
  stage smallint not null default 0,
  sharing boolean not null default false,
  stage_updated_at timestamptz not null default now()
);

-- The growth limit needs the time of the last stage change; older copies of the
-- table were created before that column existed.
alter table public.shared_sunflowers
  add column if not exists stage_updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.shared_sunflowers'::regclass
      and conname = 'shared_sunflowers_stage_check'
  ) then
    alter table public.shared_sunflowers
      add constraint shared_sunflowers_stage_check check (stage between 0 and 5);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.shared_sunflowers'::regclass
      and conname = 'shared_sunflowers_flower_id_key'
  ) then
    alter table public.shared_sunflowers
      add constraint shared_sunflowers_flower_id_key unique (flower_id);
  end if;
end
$$;

-- Caregivers read and delete their own row. Writing goes only through the
-- definer RPC below, so a crafted request cannot skip the daily growth limit.
revoke all on table public.shared_sunflowers from anon;
revoke all on table public.shared_sunflowers from authenticated;
grant select, delete on table public.shared_sunflowers to authenticated;
grant all on table public.shared_sunflowers to service_role;

alter table public.shared_sunflowers enable row level security;

drop policy if exists sunflower_owner_read on public.shared_sunflowers;
create policy sunflower_owner_read on public.shared_sunflowers
  for select to authenticated
  using (
    owner_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists sunflower_owner_insert on public.shared_sunflowers;
create policy sunflower_owner_insert on public.shared_sunflowers
  for insert to authenticated
  with check (
    owner_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists sunflower_owner_update on public.shared_sunflowers;
create policy sunflower_owner_update on public.shared_sunflowers
  for update to authenticated
  using (
    owner_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  )
  with check (
    owner_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

drop policy if exists sunflower_owner_delete on public.shared_sunflowers;
create policy sunflower_owner_delete on public.shared_sunflowers
  for delete to authenticated
  using (
    owner_id = auth.uid()
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );

comment on table public.shared_sunflowers is
  'Caregiver opt-in anonymous stage only; no child identity, drawings, feelings or activity records.';

-- ---------------------------------------------------------------------------
-- ai_reports: a grown-up flags an AI answer. The AI's own output is stored,
-- never child text.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null,
  content text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ai_reports'::regclass
      and conname = 'ai_reports_kind_check'
  ) then
    alter table public.ai_reports
      add constraint ai_reports_kind_check check (kind in ('story', 'helper'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.ai_reports'::regclass
      and conname = 'ai_reports_content_check'
  ) then
    alter table public.ai_reports
      add constraint ai_reports_content_check check (char_length(content) <= 4000);
  end if;
end
$$;

revoke all on table public.ai_reports from anon;
revoke all on table public.ai_reports from authenticated;
grant insert on table public.ai_reports to authenticated;
grant all on table public.ai_reports to service_role;

alter table public.ai_reports enable row level security;

drop policy if exists "Grown-ups can report their own AI answers" on public.ai_reports;
create policy "Grown-ups can report their own AI answers" on public.ai_reports
  for insert to authenticated
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- publish_sunflower: the first writer, superseded by grow_sunflower. It stays in
-- the database (the live project still has it) with no execute grant, so nothing
-- can call it and no older client can bypass the daily limit.
-- ---------------------------------------------------------------------------
create or replace function public.publish_sunflower(new_stage integer, opt_in boolean)
returns void
language plpgsql
security invoker
set search_path = public
as $$
BEGIN
 IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF new_stage IS NULL OR new_stage NOT BETWEEN 0 AND 5 OR opt_in IS NULL THEN RAISE EXCEPTION 'Invalid sunflower'; END IF;
 INSERT INTO public.shared_sunflowers(owner_id,stage,sharing) VALUES(auth.uid(),new_stage,opt_in)
 ON CONFLICT(owner_id) DO UPDATE SET stage = greatest(shared_sunflowers.stage, excluded.stage), sharing = excluded.sharing;
END;
$$;

revoke all on function public.publish_sunflower(integer, boolean) from public;
revoke all on function public.publish_sunflower(integer, boolean) from anon;
revoke all on function public.publish_sunflower(integer, boolean) from authenticated;

-- ---------------------------------------------------------------------------
-- read_shared_sunflowers: the caregiver's own garden view. Authenticated adults
-- only, and only flowers that opted in.
-- ---------------------------------------------------------------------------
create or replace function public.read_shared_sunflowers()
returns table(flower_id uuid, stage smallint)
language plpgsql
security definer
set search_path = public
as $$
BEGIN
 IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 RETURN QUERY SELECT s.flower_id, s.stage FROM public.shared_sunflowers s WHERE s.sharing = true ORDER BY s.flower_id LIMIT 100;
END;
$$;

revoke all on function public.read_shared_sunflowers() from public;
revoke all on function public.read_shared_sunflowers() from anon;
grant execute on function public.read_shared_sunflowers() to authenticated;

-- ---------------------------------------------------------------------------
-- read_public_sunflower_stages: the only public read. Coarse stages of opted-in
-- flowers, with no ids, owners or child data.
-- ---------------------------------------------------------------------------
create or replace function public.read_public_sunflower_stages()
returns table(stage smallint)
language sql
stable
security definer
set search_path = public
as $$
  SELECT s.stage
  FROM public.shared_sunflowers s
  WHERE s.sharing = true
  ORDER BY s.flower_id
  LIMIT 100;
$$;

revoke all on function public.read_public_sunflower_stages() from public;
grant execute on function public.read_public_sunflower_stages() to anon, authenticated;

comment on function public.read_public_sunflower_stages() is
  'Stage-only public projection for the community garden: no ids, owners or child data.';

-- ---------------------------------------------------------------------------
-- grow_sunflower: the only writer for a caregiver's flower. One stage per
-- ~20 hours no matter what the client asks for, so a crafted request cannot
-- fast-forward growth.
-- ---------------------------------------------------------------------------
create or replace function public.grow_sunflower(new_stage integer, opt_in boolean)
returns table(stage smallint, capped boolean)
language plpgsql
security definer
set search_path = public
as $$
DECLARE cur public.shared_sunflowers%ROWTYPE; target smallint; was_capped boolean := false;
BEGIN
 IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF new_stage IS NULL OR new_stage NOT BETWEEN 0 AND 5 OR opt_in IS NULL THEN RAISE EXCEPTION 'Invalid sunflower'; END IF;
 SELECT * INTO cur FROM public.shared_sunflowers s WHERE s.owner_id = auth.uid() FOR UPDATE;
 IF NOT FOUND THEN
   target := LEAST(new_stage, 1);
   was_capped := new_stage > target;
   INSERT INTO public.shared_sunflowers(owner_id, stage, sharing, stage_updated_at) VALUES (auth.uid(), target, opt_in, now());
 ELSE
   target := cur.stage;
   IF new_stage > cur.stage THEN
     IF cur.stage_updated_at <= now() - interval '20 hours' THEN target := cur.stage + 1; END IF;
     was_capped := new_stage > target;
   END IF;
   UPDATE public.shared_sunflowers s SET stage = target, sharing = opt_in,
     stage_updated_at = CASE WHEN target > cur.stage THEN now() ELSE cur.stage_updated_at END
   WHERE s.owner_id = auth.uid();
 END IF;
 RETURN QUERY SELECT target, was_capped;
END;
$$;

revoke all on function public.grow_sunflower(integer, boolean) from public;
revoke all on function public.grow_sunflower(integer, boolean) from anon;
grant execute on function public.grow_sunflower(integer, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- delete_my_account: Apple requires in-app deletion, and the app must not hold a
-- service-role key. This definer function removes only the caller's own rows.
-- ---------------------------------------------------------------------------
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM public.shared_sunflowers WHERE owner_id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;

comment on function public.delete_my_account() is
  'Deletes the calling caregiver''s shared sunflower and auth account; no service-role key needed.';

commit;
