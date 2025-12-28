-- Migration: Add shared token for user-distributed links
-- This enables the dual-token system:
--   - Per-invitation tokens: for system-sent emails (existing)
--   - Per-cycle shared token: for user-shared links (new)

-- Add shared_token to feedback_cycles
ALTER TABLE public.feedback_cycles
ADD COLUMN IF NOT EXISTS shared_token UUID UNIQUE DEFAULT uuid_generate_v4();

-- Add index for shared token lookups
CREATE INDEX IF NOT EXISTS idx_cycles_shared_token ON public.feedback_cycles(shared_token);

-- Update responses table to support shared-link responses
-- These responses link directly to cycle instead of invitation

-- Make invitation_id nullable (was required before)
ALTER TABLE public.responses
ALTER COLUMN invitation_id DROP NOT NULL;

-- Add cycle_id for shared-link responses
ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES public.feedback_cycles(id) ON DELETE CASCADE;

-- Add responder identity fields (optional, for shared-link responses)
ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS responder_email TEXT;

ALTER TABLE public.responses
ADD COLUMN IF NOT EXISTS responder_name TEXT;

-- Add constraint: either invitation_id or cycle_id must be set
ALTER TABLE public.responses
ADD CONSTRAINT response_source CHECK (invitation_id IS NOT NULL OR cycle_id IS NOT NULL);

-- Add index for cycle_id lookups
CREATE INDEX IF NOT EXISTS idx_responses_cycle ON public.responses(cycle_id);
