CREATE TABLE public.shared_sunflowers (
 owner_id uuid PRIMARY KEY,
 flower_id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 stage smallint NOT NULL DEFAULT 0 CHECK (stage BETWEEN 0 AND 5),
 sharing boolean NOT NULL DEFAULT false
);
GRANT SELECT, INSERT, UPDATE ON public.shared_sunflowers TO authenticated;
GRANT ALL ON public.shared_sunflowers TO service_role;
ALTER TABLE public.shared_sunflowers ENABLE ROW LEVEL SECURITY;
CREATE POLICY sunflower_owner_read ON public.shared_sunflowers FOR SELECT TO authenticated USING (owner_id = auth.uid() AND COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) = false);
CREATE POLICY sunflower_owner_insert ON public.shared_sunflowers FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) = false);
CREATE POLICY sunflower_owner_update ON public.shared_sunflowers FOR UPDATE TO authenticated USING (owner_id = auth.uid() AND COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) = false) WITH CHECK (owner_id = auth.uid() AND COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) = false);
CREATE FUNCTION public.publish_sunflower(new_stage integer, opt_in boolean) RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 IF new_stage IS NULL OR new_stage NOT BETWEEN 0 AND 5 OR opt_in IS NULL THEN RAISE EXCEPTION 'Invalid sunflower'; END IF;
 INSERT INTO public.shared_sunflowers(owner_id,stage,sharing) VALUES(auth.uid(),new_stage,opt_in)
 ON CONFLICT(owner_id) DO UPDATE SET stage = greatest(shared_sunflowers.stage, excluded.stage), sharing = excluded.sharing;
END;
$$;
REVOKE ALL ON FUNCTION public.publish_sunflower(integer,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.publish_sunflower(integer,boolean) TO authenticated;
CREATE FUNCTION public.read_shared_sunflowers() RETURNS TABLE(flower_id uuid, stage smallint) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF auth.uid() IS NULL OR COALESCE((auth.jwt()->>'is_anonymous')::boolean, false) THEN RAISE EXCEPTION 'Unauthorized'; END IF;
 RETURN QUERY SELECT s.flower_id, s.stage FROM public.shared_sunflowers s WHERE s.sharing = true ORDER BY s.flower_id LIMIT 100;
END;
$$;
REVOKE ALL ON FUNCTION public.read_shared_sunflowers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.read_shared_sunflowers() TO authenticated;
COMMENT ON TABLE public.shared_sunflowers IS 'Caregiver opt-in anonymous stage only; no child identity, drawings, feelings or activity records.';