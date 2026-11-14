-- Tighten anonymous access and permit caregiver-owned deletion only.
-- Mirrors the live database hardening applied on 2026-11-14.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.shared_sunflowers FROM anon, PUBLIC;
REVOKE ALL PRIVILEGES ON TABLE public.shared_sunflowers FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.shared_sunflowers TO authenticated;

DROP POLICY IF EXISTS sunflower_owner_delete ON public.shared_sunflowers;
CREATE POLICY sunflower_owner_delete
  ON public.shared_sunflowers
  FOR DELETE
  TO authenticated
  USING (
    owner_id = auth.uid()
    AND COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) = false
  );

COMMIT;
