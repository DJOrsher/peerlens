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
 * Send invitations for a cycle (sends emails via Resend)
 */
export async function sendInvitations(cycleId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get cycle with mode
  const { data: cycle, error: cycleError } = await supabase
    .from('feedback_cycles')
    .select('id, mode, user_id')
    .eq('id', cycleId)
    .eq('user_id', user.id)
    .single()

  if (cycleError || !cycle) {
    return { error: 'Cycle not found' }
  }

  // Get user info for email template
  const { data: userData } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', user.id)
    .single()

  const requesterName = userData?.name || userData?.email?.split('@')[0] || 'A colleague'
  const requesterEmail = userData?.email || user.email || ''

  // Get unsent invitations with tokens
  const { data: invitations, error: fetchError } = await supabase
    .from('invitations')
    .select('id, email, token')
    .eq('cycle_id', cycleId)
    .is('sent_at', null)

  if (fetchError) {
    console.error('Fetch invitations error:', fetchError)
    return { error: 'Failed to fetch invitations' }
  }

  if (!invitations || invitations.length === 0) {
    return { error: 'No unsent invitations found' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://peerlens.app'
  const isAnonymous = cycle.mode === 'anonymous'

  // Send emails to each invitation
  const { sendEmail } = await import('@/lib/resend')
  const { inviteEmail } = await import('@/lib/emails/templates')

  let successCount = 0
  const failedEmails: string[] = []

  for (const invitation of invitations) {
    const respondLink = `${appUrl}/respond/${invitation.token}`
    const template = inviteEmail({
      requesterName,
      requesterEmail,
      respondLink,
      isAnonymous,
    })

    try {
      await sendEmail({
        to: invitation.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        type: 'invite',
        metadata: { cycleId, invitationId: invitation.id },
      })

      // Mark this invitation as sent
      await supabase
        .from('invitations')
        .update({ sent_at: new Date().toISOString(), sent_via: 'product' })
        .eq('id', invitation.id)

      successCount++
    } catch (error) {
      console.error(`Failed to send invite to ${invitation.email}:`, error)
      failedEmails.push(invitation.email)
    }
  }

  // Update cycle status to active if any emails sent
  if (successCount > 0) {
    await supabase
      .from('feedback_cycles')
      .update({ status: 'active' })
      .eq('id', cycleId)
  }

  if (failedEmails.length > 0) {
    return {
      success: true,
      count: successCount,
      emails: invitations.filter(i => !failedEmails.includes(i.email)).map(i => i.email),
      warning: `Failed to send to: ${failedEmails.join(', ')}`,
    }
  }

  return {
    success: true,
    count: successCount,
    emails: invitations.map(i => i.email),
  }
}

/**
 * Send a reminder for a specific invitation (max 2 per invitation)
 */
export async function sendReminder(invitationId: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get invitation and verify cycle ownership
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select(`
      id, email, token, reminder_count, status,
      cycle:feedback_cycles!inner(id, mode, user_id)
    `)
    .eq('id', invitationId)
    .single()

  if (invError || !invitation) {
    return { error: 'Invitation not found' }
  }

  // Type assertion for the joined cycle
  const cycle = invitation.cycle as unknown as { id: string; mode: string; user_id: string }

  if (cycle.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  if (invitation.status !== 'pending') {
    return { error: 'Cannot send reminder - invitation is not pending' }
  }

  if (invitation.reminder_count >= 2) {
    return { error: 'Maximum reminders (2) already sent' }
  }

  // Get user info for email template
  const { data: userData } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', user.id)
    .single()

  const requesterName = userData?.name || userData?.email?.split('@')[0] || 'A colleague'
  const requesterEmail = userData?.email || user.email || ''

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://peerlens.app'
  const respondLink = `${appUrl}/respond/${invitation.token}`

  // Send reminder email
  const { sendEmail } = await import('@/lib/resend')
  const { reminderEmail } = await import('@/lib/emails/templates')

  const template = reminderEmail({
    requesterName,
    requesterEmail,
    respondLink,
    reminderNumber: invitation.reminder_count + 1,
  })

  try {
    await sendEmail({
      to: invitation.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
      type: 'reminder',
      metadata: { cycleId: cycle.id, invitationId: invitation.id },
    })

    // Update reminder count
    await supabase
      .from('invitations')
      .update({
        reminder_count: invitation.reminder_count + 1,
        last_reminder_at: new Date().toISOString(),
      })
      .eq('id', invitationId)

    return { success: true, reminderCount: invitation.reminder_count + 1 }
  } catch (error) {
    console.error('Failed to send reminder:', error)
    return { error: 'Failed to send reminder email' }
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

  const [selfAssessment, customQuestions, invitations] = await Promise.all([
    getSelfAssessment(cycleId),
    getCustomQuestions(cycleId),
    getInvitations(cycleId),
  ])

  return {
    id: cycle.id,
    user_id: cycle.user_id,
    mode: cycle.mode as FeedbackMode,
    status: cycle.status,
    created_at: cycle.created_at,
    shared_token: cycle.shared_token,
    self_assessment: selfAssessment,
    custom_questions: customQuestions as CycleCustomQuestion[],
    invitations: invitations as CycleInvitation[],
    responses_count: cycle.responses_count || 0,
  }
}

/**
 * Get response count for a cycle (for polling)
 */
export async function getResponseCount(cycleId: string): Promise<number | null> {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('feedback_cycles')
    .select('responses_count')
    .eq('id', cycleId)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data.responses_count ?? 0
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
    .select('id, status, responses_count')
    .eq('id', cycleId)
    .eq('user_id', user.id)
    .single()

  // Get invitation count separately
  const { count: invitationsCount } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('cycle_id', cycleId)

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
    })
    .eq('id', cycleId)

  if (updateError) {
    console.error('Conclude cycle error:', updateError)
    return { error: 'Failed to conclude cycle' }
  }

  // Send "report ready" email to requester
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', user.id)
      .single()

    if (userData?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://peerlens.app'
      const { sendEmail } = await import('@/lib/resend')
      const { reportReadyEmail } = await import('@/lib/emails/templates')

      const template = reportReadyEmail({
        userName: userData.name || '',
        responsesCount: cycle.responses_count || 0,
        invitationsCount: invitationsCount || 0,
        reportLink: `${appUrl}/report/${cycleId}`,
      })

      await sendEmail({
        to: userData.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        type: 'report_ready',
        metadata: { cycleId },
      })
    }
  } catch (error) {
    // Don't fail the conclude if email fails
    console.error('Failed to send report ready email:', error)
  }

  return { success: true }
}
