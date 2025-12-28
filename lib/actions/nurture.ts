'use server'

import { createServiceClient } from '@/lib/supabase/server'

/**
 * Add a lead to the nurture sequence
 */
export async function addNurtureLead(email: string, name?: string) {
  const supabase = createServiceClient()

  // Calculate first email date (7 days from now)
  const nextEmailAt = new Date()
  nextEmailAt.setDate(nextEmailAt.getDate() + 7)

  // Check if already exists
  const { data: existing } = await supabase
    .from('nurture_leads')
    .select('id, status')
    .eq('email', email.toLowerCase())
    .single()

  if (existing) {
    // If unsubscribed, don't re-add
    if (existing.status === 'unsubscribed') {
      return { error: 'This email has unsubscribed from reminders' }
    }
    // If already active or converted, just acknowledge
    return { success: true, message: 'Already signed up' }
  }

  // Insert new lead
  const { error } = await supabase
    .from('nurture_leads')
    .insert({
      email: email.toLowerCase(),
      name: name || null,
      source: 'post_response',
      status: 'active',
      emails_sent: 0,
      next_email_at: nextEmailAt.toISOString(),
    })

  if (error) {
    console.error('Add nurture lead error:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  return { success: true }
}

/**
 * Mark a lead as converted (they started their own cycle)
 */
export async function markLeadConverted(email: string) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('nurture_leads')
    .update({
      status: 'converted',
      converted_at: new Date().toISOString(),
    })
    .eq('email', email.toLowerCase())
    .eq('status', 'active')

  if (error) {
    console.error('Mark lead converted error:', error)
  }
}
