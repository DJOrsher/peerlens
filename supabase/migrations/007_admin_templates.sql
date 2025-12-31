-- ============================================
-- Sprint 7: Admin Template Management
-- ============================================

-- ============================================
-- ADD QUESTION TYPE TO QUESTIONS
-- ============================================
ALTER TABLE public.skill_template_questions
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'rating'
  CHECK (question_type IN ('rating', 'single_choice', 'multi_choice', 'text', 'scale'));

-- ============================================
-- QUESTION OPTIONS TABLE (per-question answers)
-- ============================================
CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.skill_template_questions(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  option_order INTEGER NOT NULL,
  is_separator BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(question_id, value),
  UNIQUE(question_id, option_order)
);

CREATE INDEX IF NOT EXISTS idx_question_options_question ON public.question_options(question_id);

-- ============================================
-- ADD DEFAULT FLAG TO TEMPLATES
-- ============================================
ALTER TABLE public.skill_templates
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Only one template can be default
CREATE UNIQUE INDEX IF NOT EXISTS idx_skill_templates_default
  ON public.skill_templates(is_default) WHERE is_default = true;

-- Set PM template as default
UPDATE public.skill_templates
  SET is_default = true
  WHERE slug = 'product-manager';

-- ============================================
-- RLS POLICIES FOR QUESTION OPTIONS
-- ============================================
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;

-- Options are readable by everyone (needed for responder forms)
CREATE POLICY "Question options are publicly readable" ON public.question_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.skill_template_questions q
      JOIN public.skill_templates t ON t.id = q.template_id
      WHERE q.id = question_options.question_id AND t.is_active = true
    )
  );

-- ============================================
-- ADMIN POLICIES (service role bypasses RLS)
-- ============================================
-- Admin operations use service role client, so no additional policies needed
-- The service role has full access to all tables

-- ============================================
-- GRANTS
-- ============================================
GRANT SELECT ON public.question_options TO anon, authenticated;

-- ============================================
-- SEED: Default Rating Options for PM Template
-- ============================================
-- Get all PM template question IDs and insert default rating options
DO $$
DECLARE
  q_record RECORD;
BEGIN
  FOR q_record IN
    SELECT q.id FROM public.skill_template_questions q
    JOIN public.skill_templates t ON t.id = q.template_id
    WHERE t.slug = 'product-manager'
  LOOP
    INSERT INTO public.question_options (question_id, value, label, description, option_order, is_separator) VALUES
      (q_record.id, 'bottom_20', 'Bottom 20%', 'Noticeably weaker than most', 1, false),
      (q_record.id, 'below_average', 'Below average', 'Some gaps compared to peers', 2, false),
      (q_record.id, 'average', 'Average', 'About the same as most PMs', 3, false),
      (q_record.id, 'above_average', 'Above average', 'Better than most PMs I''ve worked with', 4, false),
      (q_record.id, 'top_20', 'Top 20%', 'Among the best I''ve seen', 5, false),
      (q_record.id, 'cant_say', 'Not sure', 'I haven''t seen enough to judge', 6, true)
    ON CONFLICT (question_id, value) DO NOTHING;
  END LOOP;
END $$;
