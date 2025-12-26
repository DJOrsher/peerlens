-- ============================================
-- Sprint 3: Responses Schema
-- ============================================

-- ============================================
-- RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,

  -- Pre-screen
  closeness TEXT NOT NULL CHECK (closeness IN ('very_close', 'somewhat', 'not_much', 'barely')),
  relationship TEXT NOT NULL CHECK (relationship IN ('team', 'cross_functional', 'manager', 'peer_pm', 'other')),

  -- Skill ratings (JSONB: { "discovery": "above_average", ... })
  skill_ratings JSONB NOT NULL DEFAULT '{}',

  -- Open-ended questions
  keep_doing TEXT NOT NULL,
  improve TEXT NOT NULL,
  anything_else TEXT,

  -- Custom question answers (array of strings, matching custom_questions order)
  custom_answers JSONB DEFAULT '[]',

  -- Anonymous note (only for Named mode)
  anonymous_note TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_invitation_id ON public.responses(invitation_id);

-- Ensure one response per invitation
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_unique_invitation ON public.responses(invitation_id);

-- ============================================
-- RLS POLICIES FOR RESPONSES
-- ============================================
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Responses can be inserted by anyone (public form, no auth required)
-- We use a service role or specific policy for this
CREATE POLICY "Anyone can insert responses" ON public.responses
  FOR INSERT WITH CHECK (true);

-- Only cycle owner can view responses (via invitation -> cycle)
CREATE POLICY "Cycle owner can view responses" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      JOIN public.feedback_cycles c ON i.cycle_id = c.id
      WHERE i.id = responses.invitation_id AND c.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTION: Update invitation status on response
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_response_submitted()
RETURNS TRIGGER AS $$
BEGIN
  -- Update invitation status to 'responded'
  UPDATE public.invitations
  SET
    status = 'responded',
    responded_at = NOW()
  WHERE id = NEW.invitation_id;

  -- Increment responses_count on the cycle
  UPDATE public.feedback_cycles
  SET responses_count = responses_count + 1
  WHERE id = (
    SELECT cycle_id FROM public.invitations WHERE id = NEW.invitation_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: After response insert
-- ============================================
DROP TRIGGER IF EXISTS on_response_submitted ON public.responses;
CREATE TRIGGER on_response_submitted
  AFTER INSERT ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.handle_response_submitted();

-- ============================================
-- GRANTS
-- ============================================
GRANT ALL ON public.responses TO anon, authenticated;
