'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireAuth } from './auth'
import type { FeedbackMode, SkillRating, CycleWithDetails, CycleInvitation, CycleCustomQuestion } from '@/types/database'

const PM_TEMPLATE_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Create a new feedback cycle
 */
export async function createCycle(mode: FeedbackMode, templateId: string = PM_TEMPLATE_ID) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: cycle, error } = await supabase
    .from('feedback_cycles')
    .insert({
      user_id: user.id,
      mode,
      status: 'pending',
      template_id: templateId,
    })
    .select()
    .single()

  if (error) {
    console.error('Create cycle error:', error)
    return { error: 'Failed to create feedback cycle' }
  }

  return { cycle }
}

/**
 * Get a cycle by ID (only if owned by current user)
 */
export async function getCycle(cycleId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: cycle, error } = await supabase
    .from('feedback_cycles')
    .select('*')
    .eq('id', cycleId)
    .eq('user_id', user.id)
    .single()

  if (error || !cycle) {
    return null
  }

  return cycle
}

/**
 * Get all cycles for the current user
 */
export async function getUserCycles() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: cycles, error } = await supabase
    .from('feedback_cycles')
    .select(`
      *,
      invitations:invitations(count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Get cycles error:', error)
    return []
  }

  return cycles || []
}

/**
 * Save self-assessment for a cycle
 */
export async function saveSelfAssessment(
  cycleId: string,
  skillRatings: Record<string, SkillRating>
) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verify cycle ownership
  const cycle = await getCycle(cycleId)
  if (!cycle) {
    return { error: 'Cycle not found' }
  }

  // Upsert self-assessment
  const { error } = await supabase
    .from('self_assessments')
    .upsert({
      cycle_id: cycleId,
      user_id: user.id,
      skill_ratings: skillRatings,
    }, {
      onConflict: 'cycle_id'
    })

  if (error) {
    console.error('Save self-assessment error:', error)
    return { error: 'Failed to save self-assessment' }
  }

  return { success: true }
}

/**
 * Get self-assessment for a cycle
 */
export async function getSelfAssessment(cycleId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('self_assessments')
    .select('*')
    .eq('cycle_id', cycleId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Save custom questions for a cycle
 */
export async function saveCustomQuestions(cycleId: string, questions: string[]) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verify cycle ownership
  const cycle = await getCycle(cycleId)
  if (!cycle) {
    return { error: 'Cycle not found' }
  }

  // Delete existing questions
  await supabase
    .from('custom_questions')
    .delete()
    .eq('cycle_id', cycleId)

  // Insert new questions
  if (questions.length > 0) {
    const { error } = await supabase
      .from('custom_questions')
      .insert(
        questions.map((q, i) => ({
          cycle_id: cycleId,
          question_text: q,
          question_order: i + 1,
        }))
      )

    if (error) {
      console.error('Save custom questions error:', error)
      return { error: 'Failed to save custom questions' }
    }
  }

  return { success: true }
}

/**
 * Get custom questions for a cycle
 */
export async function getCustomQuestions(cycleId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_questions')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('question_order')

  if (error) {
    return []
  }

  return data || []
}

/**
 * Add invitations to a cycle
 */
export async function addInvitations(cycleId: string, emails: string[]) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verify cycle ownership
  const cycle = await getCycle(cycleId)
  if (!cycle) {
    return { error: 'Cycle not found' }
  }

  // Insert invitations (ignore duplicates)
  const { data, error } = await supabase
    .from('invitations')
    .insert(
      emails.map(email => ({
        cycle_id: cycleId,
        email: email.toLowerCase().trim(),
      }))
    )
    .select()

  if (error) {
    // Handle unique constraint violation gracefully
    if (error.code === '23505') {
      return { error: 'Some emails have already been invited' }
    }
    console.error('Add invitations error:', error)
    return { error: 'Failed to add invitations' }
  }

  return { invitations: data }
}

/**
 * Get invitations for a cycle
 */
export async function getInvitations(cycleId: string) {
  await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('cycle_id', cycleId)
    .order('created_at')

  if (error) {
    return []
  }

  return data || []
}

/**
 * Send invitations for a cycle (marks them as sent)
 */
export async function sendInvitations(cycleId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verify cycle ownership
  const cycle = await getCycle(cycleId)
  if (!cycle) {
    return { error: 'Cycle not found' }
  }

  // Get unsent invitations
  const { data: invitations, error: fetchError } = await supabase
    .from('invitations')
    .select('id, email')
    .eq('cycle_id', cycleId)
    .is('sent_at', null)

  if (fetchError) {
    console.error('Fetch invitations error:', fetchError)
    return { error: 'Failed to fetch invitations' }
  }

  if (!invitations || invitations.length === 0) {
    return { error: 'No unsent invitations found' }
  }

  // Mark invitations as sent
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ sent_at: new Date().toISOString() })
    .eq('cycle_id', cycleId)
    .is('sent_at', null)

  if (updateError) {
    console.error('Update invitations error:', updateError)
    return { error: 'Failed to update invitations' }
  }

  // Update cycle status to active
  await supabase
    .from('feedback_cycles')
    .update({ status: 'active' })
    .eq('id', cycleId)

  // TODO: Actually send emails via email service
  // For now, just mark as sent

  return {
    success: true,
    count: invitations.length,
    emails: invitations.map(i => i.email)
  }
}

/**
 * Get cycle with all related data
 */
export async function getCycleWithDetails(cycleId: string): Promise<CycleWithDetails | null> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: cycle, error } = await supabase
    .from('feedback_cycles')
    .select('*')
    .eq('id', cycleId)
    .eq('user_id', user.id)
    .single()

  if (error || !cycle) {
    return null
  }

  const [selfAssessment, customQuestions, invitations, responsesResult] = await Promise.all([
    getSelfAssessment(cycleId),
    getCustomQuestions(cycleId),
    getInvitations(cycleId),
    supabase
      .from('invitations')
      .select('id', { count: 'exact' })
      .eq('cycle_id', cycleId)
      .eq('status', 'responded'),
  ])

  return {
    id: cycle.id,
    user_id: cycle.user_id,
    mode: cycle.mode as FeedbackMode,
    status: cycle.status,
    created_at: cycle.created_at,
    self_assessment: selfAssessment,
    custom_questions: customQuestions as CycleCustomQuestion[],
    invitations: invitations as CycleInvitation[],
    responses_count: responsesResult.count || 0,
  }
}

/**
 * Conclude a feedback cycle (enables report viewing)
 */
export async function concludeCycle(cycleId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Verify ownership and current status
  const { data: cycle, error: fetchError } = await supabase
    .from('feedback_cycles')
    .select('id, status')
    .eq('id', cycleId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !cycle) {
    return { error: 'Cycle not found' }
  }

  if (cycle.status === 'concluded') {
    return { error: 'Cycle is already concluded' }
  }

  // Update to concluded
  const { error: updateError } = await supabase
    .from('feedback_cycles')
    .update({
      status: 'concluded',
      concluded_at: new Date().toISOString(),
    })
    .eq('id', cycleId)

  if (updateError) {
    console.error('Conclude cycle error:', updateError)
    return { error: 'Failed to conclude cycle' }
  }

  return { success: true }
}
