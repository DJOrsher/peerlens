-- ============================================
-- Sprint 6: Nurture Leads & Cron Support
-- ============================================

-- ============================================
-- NURTURE LEADS TABLE
-- ============================================
-- Captures responders who want to be reminded to start their own cycle
CREATE TABLE IF NOT EXISTS public.nurture_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'post_response', -- where they signed up
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'unsubscribed')),
  emails_sent INTEGER NOT NULL DEFAULT 0,
  next_email_at TIMESTAMPTZ,
  last_email_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nurture_leads_email ON public.nurture_leads(email);
CREATE INDEX IF NOT EXISTS idx_nurture_leads_status ON public.nurture_leads(status);
CREATE INDEX IF NOT EXISTS idx_nurture_leads_next_email ON public.nurture_leads(next_email_at)
  WHERE status = 'active' AND next_email_at IS NOT NULL;

-- RLS for nurture_leads (service role only - no client access)
ALTER TABLE public.nurture_leads ENABLE ROW LEVEL SECURITY;

-- No client policies - only service role can access

-- ============================================
-- EMAIL LOGS TABLE (for tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'invite', 'reminder', 'report_ready', 'nurture', etc.
  event_type TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON public.email_logs(email_type);

-- RLS for email_logs (service role only)
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADD last_reminder_at TO INVITATIONS
-- ============================================
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ;

-- ============================================
-- ADD sent_via TO INVITATIONS
-- ============================================
-- Track whether invitation was sent via 'product' (our emails) or 'self' (user sent manually)
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS sent_via TEXT CHECK (sent_via IN ('product', 'self'));

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.nurture_leads TO service_role;
GRANT ALL ON public.email_logs TO service_role;
