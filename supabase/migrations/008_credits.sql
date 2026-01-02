-- ============================================
-- Sprint 7.1: Credit System
-- ============================================

-- Add credits column to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 10;

-- Add index for users with low credits (for future admin queries)
CREATE INDEX IF NOT EXISTS idx_users_credits ON public.users(credits);
