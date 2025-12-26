-- ============================================
-- Sprint 2: Requester Flow Schema
-- ============================================

-- ============================================
-- FEEDBACK CYCLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.feedback_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('anonymous', 'named')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'concluded')),
  responses_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_cycles_user_id ON public.feedback_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_cycles_status ON public.feedback_cycles(status);

-- RLS for feedback_cycles
ALTER TABLE public.feedback_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cycles" ON public.feedback_cycles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cycles" ON public.feedback_cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles" ON public.feedback_cycles
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- SELF ASSESSMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.self_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID NOT NULL REFERENCES public.feedback_cycles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 6 PM Skills stored as JSONB
  -- Format: { "discovery": "above_average", "prioritization": "average", ... }
  skill_ratings JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cycle_id)
);

CREATE INDEX IF NOT EXISTS idx_self_assessments_cycle_id ON public.self_assessments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_self_assessments_user_id ON public.self_assessments(user_id);

-- RLS for self_assessments
ALTER TABLE public.self_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own self assessments" ON public.self_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own self assessments" ON public.self_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own self assessments" ON public.self_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- CUSTOM QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID NOT NULL REFERENCES public.feedback_cycles(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cycle_id, question_order)
);

CREATE INDEX IF NOT EXISTS idx_custom_questions_cycle_id ON public.custom_questions(cycle_id);

-- RLS for custom_questions
ALTER TABLE public.custom_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions for own cycles" ON public.custom_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback_cycles
      WHERE id = custom_questions.cycle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for own cycles" ON public.custom_questions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_cycles
      WHERE id = custom_questions.cycle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete questions for own cycles" ON public.custom_questions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.feedback_cycles
      WHERE id = custom_questions.cycle_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id UUID NOT NULL REFERENCES public.feedback_cycles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token UUID NOT NULL DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'expired', 'bounced')),
  sent_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  reminder_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(cycle_id, email),
  UNIQUE(token)
);

CREATE INDEX IF NOT EXISTS idx_invitations_cycle_id ON public.invitations(cycle_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);

-- RLS for invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view invitations for own cycles" ON public.invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback_cycles
      WHERE id = invitations.cycle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invitations for own cycles" ON public.invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback_cycles
      WHERE id = invitations.cycle_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invitations for own cycles" ON public.invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.feedback_cycles
      WHERE id = invitations.cycle_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE TRIGGER update_feedback_cycles_updated_at
  BEFORE UPDATE ON public.feedback_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_self_assessments_updated_at
  BEFORE UPDATE ON public.self_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.feedback_cycles TO anon, authenticated;
GRANT ALL ON public.self_assessments TO anon, authenticated;
GRANT ALL ON public.custom_questions TO anon, authenticated;
GRANT ALL ON public.invitations TO anon, authenticated;
