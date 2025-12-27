import { z } from 'zod'

// Constraints - single source of truth
export const CONSTRAINTS = {
  INVITATIONS_MIN: 3,
  INVITATIONS_MAX: 10,
  FEEDBACK_TEXT_MIN: 10,
} as const

// Response submission schema
export const responseSchema = z.object({
  closeness: z.enum(['very_close', 'somewhat', 'not_much', 'barely']),
  relationship: z.enum(['team', 'cross_functional', 'manager', 'peer_pm', 'other']),
  skill_ratings: z.record(z.string(), z.enum(['bottom_20', 'below_average', 'average', 'above_average', 'top_20', 'cant_say'])),
  keep_doing: z.string().min(CONSTRAINTS.FEEDBACK_TEXT_MIN, `Please provide at least ${CONSTRAINTS.FEEDBACK_TEXT_MIN} characters`),
  improve: z.string().min(CONSTRAINTS.FEEDBACK_TEXT_MIN, `Please provide at least ${CONSTRAINTS.FEEDBACK_TEXT_MIN} characters`),
  anything_else: z.string().optional(),
  custom_answers: z.array(z.string()).optional(),
  anonymous_note: z.string().optional(),
})

export type ResponseInput = z.infer<typeof responseSchema>

export function getFirstError(result: { success: false; error: z.ZodError }): string {
  return result.error.issues[0]?.message || 'Validation failed'
}
