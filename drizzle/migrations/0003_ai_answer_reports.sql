CREATE TABLE public.ai_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('story','helper')),
  content text NOT NULL CHECK (char_length(content) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.ai_reports TO authenticated;
GRANT ALL ON public.ai_reports TO service_role;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Grown-ups can report their own AI answers" ON public.ai_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);