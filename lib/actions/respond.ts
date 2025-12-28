'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { responseSchema, getFirstError } from '@/lib/validation'
import type { ResponseInput } from '@/lib/validation'
import type { FeedbackMode } from '@/types/database'

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

export interface SharedCycleInfo {
  id: string
  mode: FeedbackMode
  status: string
  template_id: string
  user_email: string
  user_name: string | null
}

/**
 * Get invitation by token (public - no auth required)
 */
export async function getInvitationByToken(token: string): Promise<InvitationWithCycle | null> {
  // Use service client - responders are not authenticated, RLS would block them
  const supabase = createServiceClient()

  // Validate token format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    return null
  }

  // First get the invitation with cycle info
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
        user_id
      )
    `)
    .eq('token', token)
    .single()

  if (error || !invitation) {
    console.error('Get invitation error:', error)
    return null
  }

  // Then get the user info separately (no direct FK from feedback_cycles to public.users)
  // Supabase returns joined data as array, take first element
  const cycleData = invitation.cycle as unknown as { id: string; mode: FeedbackMode; template_id: string; user_id: string }[] | { id: string; mode: FeedbackMode; template_id: string; user_id: string }
  const cycle = Array.isArray(cycleData) ? cycleData[0] : cycleData
  const { data: user } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', cycle.user_id)
    .single()

  if (!user) {
    console.error('User not found for cycle:', cycle.user_id)
    return null
  }

  // Check if already responded
  const { data: existingResponse } = await supabase
    .from('responses')
    .select('id')
    .eq('invitation_id', invitation.id)
    .single()

  return {
    id: invitation.id,
    token: invitation.token,
    email: invitation.email,
    status: invitation.status,
    cycle: {
      id: cycle.id,
      mode: cycle.mode,
      template_id: cycle.template_id,
      user_email: user.email,
      user_name: user.name,
    },
    has_responded: !!existingResponse,
  }
}

/**
 * Get template questions for responder
 */
export async function getTemplateQuestionsForResponder(templateId: string) {
  const supabase = createServiceClient()

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
  const supabase = createServiceClient()

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

  const supabase = createServiceClient()

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

/**
 * Get cycle by shared token (public - for user-shared links)
 */
export async function getCycleBySharedToken(sharedToken: string): Promise<SharedCycleInfo | null> {
  const supabase = createServiceClient()

  // Validate token format (UUID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(sharedToken)) {
    return null
  }

  const { data: cycle, error } = await supabase
    .from('feedback_cycles')
    .select('id, mode, status, template_id, user_id')
    .eq('shared_token', sharedToken)
    .single()

  if (error || !cycle) {
    console.error('Get cycle by shared token error:', error)
    return null
  }

  // Get user info
  const { data: user } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', cycle.user_id)
    .single()

  if (!user) {
    console.error('User not found for cycle:', cycle.user_id)
    return null
  }

  return {
    id: cycle.id,
    mode: cycle.mode as FeedbackMode,
    status: cycle.status,
    template_id: cycle.template_id,
    user_email: user.email,
    user_name: user.name,
  }
}

/**
 * Submit a response via shared link (public - no auth required)
 */
export async function submitSharedResponse(
  cycleId: string,
  data: ResponseInput & { responder_email?: string; responder_name?: string }
) {
  // Validate with Zod
  const validated = responseSchema.safeParse(data)
  if (!validated.success) {
    return { error: getFirstError(validated) }
  }

  const supabase = createServiceClient()

  // Insert response linked to cycle (not invitation)
  const { error } = await supabase
    .from('responses')
    .insert({
      cycle_id: cycleId,
      responder_email: data.responder_email?.trim() || null,
      responder_name: data.responder_name?.trim() || null,
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
    console.error('Submit shared response error:', error)
    return { error: 'Failed to submit response. Please try again.' }
  }

  // Update response count on cycle
  const { data: cycle } = await supabase
    .from('feedback_cycles')
    .select('responses_count')
    .eq('id', cycleId)
    .single()

  if (cycle) {
    await supabase
      .from('feedback_cycles')
      .update({ responses_count: (cycle.responses_count || 0) + 1 })
      .eq('id', cycleId)
  }

  return { success: true }
}
