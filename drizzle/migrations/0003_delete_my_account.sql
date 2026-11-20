-- Caregiver account deletion without the service-role key.
--
-- The app calls this RPC with the caregiver's own session. It runs with its
-- creator's privileges (postgres, in the Supabase SQL editor), so it can remove
-- the auth row while only ever touching the caller's own data: the shared
-- sunflower is deleted first, then the auth user (which cascades to sessions
-- and refresh tokens). Signed-out and anonymous callers are refused, and only
-- authenticated accounts may execute it.
BEGIN;

CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;

COMMENT ON FUNCTION public.delete_my_account() IS
  'Deletes the calling caregiver''s shared sunflower and auth account; no service-role key needed.';

COMMIT;
