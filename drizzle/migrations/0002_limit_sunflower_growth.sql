ALTER TABLE public.shared_sunflowers ADD COLUMN IF NOT EXISTS stage_updated_at timestamptz NOT NULL DEFAULT now();
REVOKE INSERT, UPDATE ON public.shared_sunflowers FROM authenticated;
CREATE OR REPLACE FUNCTION public.grow_sunflower(new_stage integer, opt_in boolean)
RETURNS TABLE(stage smallint, capped boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
REVOKE ALL ON FUNCTION public.grow_sunflower(integer, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grow_sunflower(integer, boolean) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.publish_sunflower(integer, boolean) FROM authenticated;