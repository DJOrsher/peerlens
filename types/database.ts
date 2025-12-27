/**
 * Database types for PeerLens
 * These types define the contract between UI and business logic
 */

// ============================================
// ENUMS
// ============================================

export type FeedbackMode = 'named' | 'anonymous'

export type CycleStatus = 'draft' | 'pending' | 'concluded'

export type InvitationStatus = 'pending' | 'completed' | 'expired' | 'bounced'

export type RelationshipType =
  | 'team'
  | 'cross_functional'
  | 'manager'
  | 'peer_pm'
  | 'other'

export type ClosenessLevel =
  | 'very_close'
  | 'somewhat'
  | 'not_much'
  | 'barely'

export type SkillRating =
  | 'bottom_20'
  | 'below_average'
  | 'average'
  | 'above_average'
  | 'top_20'
  | 'cant_say'

export type NurtureStatus = 'active' | 'converted' | 'unsubscribed' | 'completed'

export type EmailType =
  | 'invite'
  | 'reminder'
  | 'report_ready'
  | 'no_responses'
  | 'nurture_1'
  | 'nurture_2'
  | 'nurture_3'
  | 'follow_up_30d'

export type EmailEventType =
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'complained'

// ============================================
// DATABASE TABLES
// ============================================

export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

export interface FeedbackCycle {
  id: string
  user_id: string
  mode: FeedbackMode
  status: CycleStatus
  created_at: string
  updated_at: string
  concluded_at: string | null
  report_viewed_at: string | null
  invitations_count: number
  responses_count: number
  auto_conclude_at: string | null
}

export interface SelfAssessment {
  id: string
  cycle_id: string
  skill_ratings: Record<string, SkillRating>
  custom_questions: string[]
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  cycle_id: string
  email: string
  name: string | null
  token: string
  status: InvitationStatus
  sent_at: string | null
  sent_via: 'product' | 'self' | null
  reminder_count: number
  last_reminder_at: string | null
  responded_at: string | null
  created_at: string
  expires_at: string
}

export interface Response {
  id: string
  invitation_id: string
  closeness: ClosenessLevel
  relationship: RelationshipType
  skill_ratings: Record<string, SkillRating>
  keep_doing: string
  improve: string
  anything_else: string | null
  anonymous_note: string | null
  custom_answers: string[]
  created_at: string
}

export interface NurtureLead {
  id: string
  email: string
  source_cycle_id: string | null
  status: NurtureStatus
  emails_sent: number
  next_email_at: string | null
  created_at: string
  converted_at: string | null
  unsubscribed_at: string | null
}

export interface EmailEvent {
  id: string
  email_type: EmailType
  recipient_email: string
  event_type: EmailEventType
  metadata: Record<string, unknown>
  created_at: string
}

// ============================================
// SKILL DEFINITIONS
// ============================================

export const PM_SKILLS = [
  {
    id: 'discovery',
    name: 'Discovery & User Understanding',
    description: 'Depth of customer/user insight',
  },
  {
    id: 'prioritization',
    name: 'Prioritization & Roadmap',
    description: 'Quality of trade-off decisions',
  },
  {
    id: 'execution',
    name: 'Execution & Delivery',
    description: 'Getting things shipped',
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Clarity, frequency, right audience',
  },
  {
    id: 'stakeholder_management',
    name: 'Stakeholder Management',
    description: 'Managing up, across, and down',
  },
  {
    id: 'technical_fluency',
    name: 'Technical Fluency',
    description: 'Ability to work effectively with engineering',
  },
] as const

export const SKILL_RATING_OPTIONS = [
  { value: 'bottom_20', label: 'Bottom 20%', description: 'Noticeably weaker than most' },
  { value: 'below_average', label: 'Below average', description: 'Some gaps compared to peers' },
  { value: 'average', label: 'Average', description: 'About the same as most PMs' },
  { value: 'above_average', label: 'Above average', description: 'Better than most PMs I\'ve worked with' },
  { value: 'top_20', label: 'Top 20%', description: 'Among the best I\'ve seen' },
  { value: 'cant_say', label: 'Can\'t say', description: 'I don\'t have enough visibility' },
] as const

// ============================================
// SKILL TEMPLATES
// ============================================

export interface SkillTemplate {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SkillTemplateQuestion {
  id: string
  template_id: string
  skill_key: string
  skill_name: string
  skill_description: string
  question_order: number
  use_for_self_assessment: boolean
  use_for_peer_feedback: boolean
  created_at: string
}

export interface SkillTemplateWithQuestions extends SkillTemplate {
  questions: SkillTemplateQuestion[]
}

// Cycle details types (for getCycleWithDetails)
export interface CycleInvitation {
  id: string
  email: string
  status: string
  sent_at: string | null
  responded_at: string | null
  reminder_count: number
}

export interface CycleCustomQuestion {
  id: string
  question_text: string
  question_order: number
}

export interface CycleWithDetails {
  id: string
  user_id: string
  mode: FeedbackMode
  status: string
  created_at: string
  invitations: CycleInvitation[]
  self_assessment: SelfAssessment | null
  custom_questions: CycleCustomQuestion[]
  responses_count: number
}
