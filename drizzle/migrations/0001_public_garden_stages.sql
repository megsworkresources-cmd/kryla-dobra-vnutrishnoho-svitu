GRANT USAGE ON SCHEMA public TO anon;

CREATE OR REPLACE FUNCTION public.read_public_sunflower_stages()
RETURNS TABLE(stage smallint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.stage
  FROM public.shared_sunflowers s
  WHERE s.sharing = true
  ORDER BY s.flower_id
  LIMIT 100;
$$;

REVOKE ALL ON FUNCTION public.read_public_sunflower_stages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_public_sunflower_stages() TO anon, authenticated;

COMMENT ON FUNCTION public.read_public_sunflower_stages() IS
  'Stage-only public projection for the community garden: no ids, owners or child data.';