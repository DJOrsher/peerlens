'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from './auth'
import type { FeedbackMode, SkillRating } from '@/types/database'

// Numeric mapping for skill ratings (excluding can't say)
const RATING_NUMERIC: Record<string, number> = {
  bottom_20: 1,
  below_average: 2,
  average: 3,
  above_average: 4,
  top_20: 5,
}

// Skill keys
const SKILL_KEYS = [
  'discovery',
  'prioritization',
  'execution',
  'communication',
  'stakeholder_management',
  'technical_fluency',
] as const

// Types for report data
export interface PeerRatingData {
  average: number | null
  min: number | null
  max: number | null
  distribution: Record<string, number>
  cant_say_count: number
  response_count: number
}

export interface AnonymousResponseData {
  // No relationship/closeness - these could help identify respondents
  skill_ratings: Record<string, SkillRating>
  keep_doing: string
  improve: string
  anything_else: string | null
  custom_answers: string[]
}

export interface AnonymousReport {
  mode: 'anonymous'
  responses_count: number
  invitations_count: number
  self_ratings: Record<string, SkillRating>
  peer_ratings: Record<string, PeerRatingData>
  gaps: Record<string, number | null>
  open_ended: {
    keep_doing: string[]
    improve: string[]
    anything_else: string[]
  }
  custom_questions: string[]
  custom_answers: Record<string, string[]>
  responses: AnonymousResponseData[]
}

export interface NamedResponseData {
  from: {
    email: string
    name: string | null
  }
  relationship: string
  closeness: string
  skill_ratings: Record<string, SkillRating>
  keep_doing: string
  improve: string
  anything_else: string | null
  custom_answers: string[]
}

export interface NamedReport {
  mode: 'named'
  responses_count: number
  invitations_count: number
  self_ratings: Record<string, SkillRating>
  responses: NamedResponseData[]
  anonymous_notes: string[]
  custom_questions: string[]
}

export type ReportData = AnonymousReport | NamedReport

export interface ReportResult {
  error?: string
  report?: ReportData
}

/**
 * Get report for a concluded cycle
 */
export async function getReport(cycleId: string): Promise<ReportResult> {
  const user = await requireAuth()
  const supabase = await createClient()

  // Get cycle with self-assessment and custom questions
  const { data: cycle, error: cycleError } = await supabase
    .from('feedback_cycles')
    .select(`
      id,
      mode,
      status,
      self_assessments (
        skill_ratings
      ),
      custom_questions (
        question_text,
        question_order
      )
    `)
    .eq('id', cycleId)
    .eq('user_id', user.id)
    .single()

  if (cycleError || !cycle) {
    console.error('[getReport] Cycle query error:', cycleError)
    return { error: 'Cycle not found' }
  }

  // Get invitation count separately
  const { count: invitationsCount } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('cycle_id', cycleId)

  if (cycle.status !== 'concluded') {
    return { error: 'Cycle is not concluded yet' }
  }

  // Get responses using service role (bypasses RLS)
  // We need to get both invitation-based and shared-link responses
  const serviceSupabase = await createServiceClient()

  // Get responses via invitation
  const { data: invitationResponses, error: invError } = await serviceSupabase
    .from('responses')
    .select(`
      closeness,
      relationship,
      skill_ratings,
      keep_doing,
      improve,
      anything_else,
      anonymous_note,
      custom_answers,
      invitation:invitations!inner (
        cycle_id,
        email
      )
    `)
    .eq('invitation.cycle_id', cycleId)

  // Get responses via shared link (direct cycle_id)
  const { data: sharedResponses, error: sharedError } = await serviceSupabase
    .from('responses')
    .select(`
      closeness,
      relationship,
      skill_ratings,
      keep_doing,
      improve,
      anything_else,
      anonymous_note,
      custom_answers,
      responder_email,
      responder_name
    `)
    .eq('cycle_id', cycleId)
    .is('invitation_id', null)

  if (invError || sharedError) {
    console.error('Get responses error:', invError || sharedError)
    return { error: 'Failed to load responses' }
  }

  // Normalize responses to a common format
  // Note: Supabase returns joined relations as objects (via !inner), not arrays
  const responses = [
    ...(invitationResponses || []).map(r => {
      const inv = r.invitation as { email?: string } | null
      return {
        ...r,
        responder_email: inv?.email || null,
        responder_name: null, // Invitations don't store names
      }
    }),
    ...(sharedResponses || []),
  ]

  const selfAssessment = Array.isArray(cycle.self_assessments)
    ? cycle.self_assessments[0]
    : cycle.self_assessments

  const selfRatings = (selfAssessment?.skill_ratings || {}) as Record<string, SkillRating>

  // Extract custom questions from the joined table, sorted by order
  const customQuestionsData = Array.isArray(cycle.custom_questions)
    ? cycle.custom_questions
    : []
  const customQuestions = customQuestionsData
    .sort((a: any, b: any) => (a.question_order || 0) - (b.question_order || 0))
    .map((q: any) => q.question_text) as string[]

  // Generate report based on mode
  if (cycle.mode === 'named') {
    return {
      report: generateNamedReport(
        responses || [],
        selfRatings,
        customQuestions,
        invitationsCount || 0
      ),
    }
  } else {
    return {
      report: generateAnonymousReport(
        responses || [],
        selfRatings,
        customQuestions,
        invitationsCount || 0
      ),
    }
  }
}

function generateAnonymousReport(
  responses: any[],
  selfRatings: Record<string, SkillRating>,
  customQuestions: string[],
  invitationsCount: number
): AnonymousReport {
  // Aggregate peer ratings
  const peerRatings: Record<string, PeerRatingData> = {}

  for (const skill of SKILL_KEYS) {
    const ratings = responses
      .map(r => r.skill_ratings?.[skill])
      .filter(Boolean)

    const validRatings = ratings.filter(r => r !== 'cant_say')
    const cantSayCount = ratings.filter(r => r === 'cant_say').length

    const numericRatings = validRatings
      .map(r => RATING_NUMERIC[r])
      .filter((n): n is number => n !== undefined)

    const average = numericRatings.length
      ? numericRatings.reduce((a, b) => a + b, 0) / numericRatings.length
      : null

    // Distribution
    const distribution: Record<string, number> = {}
    for (const rating of validRatings) {
      distribution[rating] = (distribution[rating] || 0) + 1
    }

    peerRatings[skill] = {
      average,
      min: numericRatings.length ? Math.min(...numericRatings) : null,
      max: numericRatings.length ? Math.max(...numericRatings) : null,
      distribution,
      cant_say_count: cantSayCount,
      response_count: validRatings.length,
    }
  }

  // Calculate gaps (peer avg - self rating)
  const gaps: Record<string, number | null> = {}
  for (const skill of SKILL_KEYS) {
    const selfNumeric = RATING_NUMERIC[selfRatings[skill]] || null
    const peerAvg = peerRatings[skill].average
    gaps[skill] = selfNumeric && peerAvg ? Math.round((peerAvg - selfNumeric) * 10) / 10 : null
  }

  // Collect and shuffle open-ended feedback
  const keepDoing = shuffleArray(responses.map(r => r.keep_doing).filter(Boolean))
  const improve = shuffleArray(responses.map(r => r.improve).filter(Boolean))
  const anythingElse = shuffleArray(responses.map(r => r.anything_else).filter(Boolean))

  // Custom question answers
  const customAnswers: Record<string, string[]> = {}
  for (let i = 0; i < customQuestions.length; i++) {
    const answers = responses
      .map(r => r.custom_answers?.[i])
      .filter(Boolean)
    customAnswers[customQuestions[i]] = shuffleArray(answers)
  }

  // Individual responses (shuffled to prevent order-based identification)
  // Deliberately omit relationship/closeness to protect anonymity
  const anonymousResponses: AnonymousResponseData[] = shuffleArray(
    responses.map(r => ({
      skill_ratings: r.skill_ratings || {},
      keep_doing: r.keep_doing,
      improve: r.improve,
      anything_else: r.anything_else,
      custom_answers: r.custom_answers || [],
    }))
  )

  return {
    mode: 'anonymous',
    responses_count: responses.length,
    invitations_count: invitationsCount,
    self_ratings: selfRatings,
    peer_ratings: peerRatings,
    gaps,
    open_ended: {
      keep_doing: keepDoing,
      improve: improve,
      anything_else: anythingElse,
    },
    custom_questions: customQuestions,
    custom_answers: customAnswers,
    responses: anonymousResponses,
  }
}

function generateNamedReport(
  responses: any[],
  selfRatings: Record<string, SkillRating>,
  customQuestions: string[],
  invitationsCount: number
): NamedReport {
  // Collect anonymous notes separately (shuffled, unattributed)
  const anonymousNotes = shuffleArray(
    responses.map(r => r.anonymous_note).filter(Boolean)
  )

  // Map individual responses with attribution
  // Uses normalized responder_email/responder_name from both invitation and shared-link responses
  const namedResponses: NamedResponseData[] = responses.map(r => ({
    from: {
      email: r.responder_email || 'Anonymous',
      name: r.responder_name || null,
    },
    relationship: r.relationship,
    closeness: r.closeness,
    skill_ratings: r.skill_ratings || {},
    keep_doing: r.keep_doing,
    improve: r.improve,
    anything_else: r.anything_else,
    custom_answers: r.custom_answers || [],
  }))

  return {
    mode: 'named',
    responses_count: responses.length,
    invitations_count: invitationsCount,
    self_ratings: selfRatings,
    responses: namedResponses,
    anonymous_notes: anonymousNotes,
    custom_questions: customQuestions,
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
