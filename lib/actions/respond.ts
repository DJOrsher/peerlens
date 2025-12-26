'use server'

import { createClient } from '@/lib/supabase/server'
import type { ClosenessLevel, RelationshipType, SkillRating } from '@/types/database'

export interface InvitationWithCycle {
  id: string
  token: string
  email: string
  status: string
  cycle: {
    id: string
    mode: 'anonymous' | 'named'
    user_email: string
    user_name: string | null
    template_id: string
  }
  has_responded: boolean
}

export interface ResponseData {
  closeness: ClosenessLevel
  relationship: RelationshipType
  skill_ratings: Record<string, SkillRating>
  keep_doing: string
  improve: string
  anything_else?: string
  custom_answers?: string[]
  anonymous_note?: string
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

  // Check if already responded
  const { data: existingResponse } = await supabase
    .from('responses')
    .select('id')
    .eq('invitation_id', invitation.id)
    .single()

  const cycle = invitation.cycle as any

  return {
    id: invitation.id,
    token: invitation.token,
    email: invitation.email,
    status: invitation.status,
    cycle: {
      id: cycle.id,
      mode: cycle.mode,
      template_id: cycle.template_id,
      user_email: cycle.user.email,
      user_name: cycle.user.name,
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
export async function submitResponse(invitationId: string, data: ResponseData) {
  const supabase = await createClient()

  // Validate minimum text lengths
  if (data.keep_doing.trim().length < 10) {
    return { error: 'Please provide at least 10 characters for "What to keep doing"' }
  }
  if (data.improve.trim().length < 10) {
    return { error: 'Please provide at least 10 characters for "What to improve"' }
  }

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
      closeness: data.closeness,
      relationship: data.relationship,
      skill_ratings: data.skill_ratings,
      keep_doing: data.keep_doing.trim(),
      improve: data.improve.trim(),
      anything_else: data.anything_else?.trim() || null,
      custom_answers: data.custom_answers || [],
      anonymous_note: data.anonymous_note?.trim() || null,
    })

  if (error) {
    console.error('Submit response error:', error)
    return { error: 'Failed to submit response. Please try again.' }
  }

  return { success: true }
}
