'use server'

import { createClient } from '@/lib/supabase/server'
import { responseSchema, getFirstError } from '@/lib/validation'
import type { ResponseInput } from '@/lib/validation'
import type { FeedbackMode } from '@/types/database'

// Type for the joined query result from Supabase
interface InvitationQueryResult {
  id: string
  token: string
  email: string
  status: string
  cycle: {
    id: string
    mode: FeedbackMode
    template_id: string
    user: {
      email: string
      name: string | null
    }
  }
}

export interface InvitationWithCycle {
  id: string
  token: string
  email: string
  status: string
  cycle: {
    id: string
    mode: FeedbackMode
    user_email: string
    user_name: string | null
    template_id: string
  }
  has_responded: boolean
}

/**
 * Get invitation by token (public - no auth required)
 */
export async function getInvitationByToken(token: string): Promise<InvitationWithCycle | null> {
  const supabase = await createClient()

  // Validate token format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    return null
  }

  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      id,
      token,
      email,
      status,
      cycle:feedback_cycles!inner (
        id,
        mode,
        template_id,
        user:users!inner (
          email,
          name
        )
      )
    `)
    .eq('token', token)
    .single()

  if (error || !invitation) {
    console.error('Get invitation error:', error)
    return null
  }

  // Type the result properly
  const typedInvitation = invitation as unknown as InvitationQueryResult

  // Check if already responded
  const { data: existingResponse } = await supabase
    .from('responses')
    .select('id')
    .eq('invitation_id', typedInvitation.id)
    .single()

  return {
    id: typedInvitation.id,
    token: typedInvitation.token,
    email: typedInvitation.email,
    status: typedInvitation.status,
    cycle: {
      id: typedInvitation.cycle.id,
      mode: typedInvitation.cycle.mode,
      template_id: typedInvitation.cycle.template_id,
      user_email: typedInvitation.cycle.user.email,
      user_name: typedInvitation.cycle.user.name,
    },
    has_responded: !!existingResponse,
  }
}

/**
 * Get template questions for responder
 */
export async function getTemplateQuestionsForResponder(templateId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('skill_template_questions')
    .select('*')
    .eq('template_id', templateId)
    .eq('use_for_peer_feedback', true)
    .order('question_order')

  if (error) {
    console.error('Get template questions error:', error)
    return []
  }

  return data || []
}

/**
 * Get custom questions for a cycle
 */
export async function getCustomQuestionsForCycle(cycleId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_questions')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('question_order')

  if (error) {
    console.error('Get custom questions error:', error)
    return []
  }

  return data || []
}

/**
 * Submit a response (public - no auth required)
 */
export async function submitResponse(invitationId: string, data: ResponseInput) {
  // Validate with Zod
  const validated = responseSchema.safeParse(data)
  if (!validated.success) {
    return { error: getFirstError(validated) }
  }

  const supabase = await createClient()

  // Check if already responded (double-submit prevention)
  const { data: existingResponse } = await supabase
    .from('responses')
    .select('id')
    .eq('invitation_id', invitationId)
    .single()

  if (existingResponse) {
    return { error: 'You have already submitted feedback for this request' }
  }

  // Insert response
  const { error } = await supabase
    .from('responses')
    .insert({
      invitation_id: invitationId,
      closeness: validated.data.closeness,
      relationship: validated.data.relationship,
      skill_ratings: validated.data.skill_ratings,
      keep_doing: validated.data.keep_doing.trim(),
      improve: validated.data.improve.trim(),
      anything_else: validated.data.anything_else?.trim() || null,
      custom_answers: validated.data.custom_answers || [],
      anonymous_note: validated.data.anonymous_note?.trim() || null,
    })

  if (error) {
    console.error('Submit response error:', error)
    return { error: 'Failed to submit response. Please try again.' }
  }

  return { success: true }
}
