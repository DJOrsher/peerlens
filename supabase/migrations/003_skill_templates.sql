-- ============================================
-- Sprint 2 Extension: Skill Templates
-- ============================================

-- ============================================
-- SKILL TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.skill_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                    -- e.g., "Product Manager", "Software Engineer"
  slug TEXT NOT NULL UNIQUE,             -- e.g., "product-manager", "software-engineer"
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_templates_slug ON public.skill_templates(slug);
CREATE INDEX IF NOT EXISTS idx_skill_templates_active ON public.skill_templates(is_active);

-- ============================================
-- SKILL TEMPLATE QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.skill_template_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.skill_templates(id) ON DELETE CASCADE,
  skill_key TEXT NOT NULL,               -- e.g., "discovery", "execution"
  skill_name TEXT NOT NULL,              -- e.g., "Discovery & User Understanding"
  skill_description TEXT NOT NULL,       -- e.g., "Depth of customer/user insight"
  question_order INTEGER NOT NULL,
  use_for_self_assessment BOOLEAN NOT NULL DEFAULT true,
  use_for_peer_feedback BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(template_id, skill_key),
  UNIQUE(template_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_skill_template_questions_template ON public.skill_template_questions(template_id);

-- ============================================
-- UPDATE FEEDBACK CYCLES TO REFERENCE TEMPLATE
-- ============================================
ALTER TABLE public.feedback_cycles
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.skill_templates(id);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE public.skill_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_template_questions ENABLE ROW LEVEL SECURITY;

-- Templates are readable by everyone (public)
CREATE POLICY "Templates are publicly readable" ON public.skill_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Template questions are publicly readable" ON public.skill_template_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.skill_templates
      WHERE id = skill_template_questions.template_id AND is_active = true
    )
  );

-- ============================================
-- SEED: Product Manager Template
-- ============================================
INSERT INTO public.skill_templates (id, name, slug, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Product Manager', 'product-manager', 'Skills framework for Product Managers')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.skill_template_questions (template_id, skill_key, skill_name, skill_description, question_order) VALUES
  ('00000000-0000-0000-0000-000000000001', 'discovery', 'Discovery & User Understanding', 'Depth of customer/user insight', 1),
  ('00000000-0000-0000-0000-000000000001', 'prioritization', 'Prioritization & Roadmap', 'Quality of trade-off decisions', 2),
  ('00000000-0000-0000-0000-000000000001', 'execution', 'Execution & Delivery', 'Getting things shipped', 3),
  ('00000000-0000-0000-0000-000000000001', 'communication', 'Communication', 'Clarity, frequency, right audience', 4),
  ('00000000-0000-0000-0000-000000000001', 'stakeholder_management', 'Stakeholder Management', 'Managing up, across, and down', 5),
  ('00000000-0000-0000-0000-000000000001', 'technical_fluency', 'Technical Fluency', 'Ability to work effectively with engineering', 6)
ON CONFLICT (template_id, skill_key) DO NOTHING;

-- ============================================
-- GRANTS
-- ============================================
GRANT SELECT ON public.skill_templates TO anon, authenticated;
GRANT SELECT ON public.skill_template_questions TO anon, authenticated;

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE TRIGGER update_skill_templates_updated_at
  BEFORE UPDATE ON public.skill_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
