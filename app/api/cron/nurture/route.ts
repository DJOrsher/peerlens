import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { nurtureEmail1, nurtureEmail2, nurtureEmail3 } from '@/lib/emails/templates'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Send nurture emails to leads
 * Schedule: Day 7, Day 21, Day 42 after signup
 * Runs daily via Vercel cron
 */
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://peerlens.app'
  const now = new Date()

  // Find leads ready for their next email
  const { data: leads, error: fetchError } = await supabase
    .from('nurture_leads')
    .select('*')
    .eq('status', 'active')
    .lte('next_email_at', now.toISOString())
    .lt('emails_sent', 3)

  if (fetchError) {
    console.error('[nurture] Failed to fetch leads:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }

  if (!leads || leads.length === 0) {
    return NextResponse.json({ message: 'No nurture emails to send', count: 0 })
  }

  let sentCount = 0
  const errors: string[] = []

  for (const lead of leads) {
    try {
      const unsubscribeLink = `${appUrl}/unsubscribe/${lead.id}`
      const emailNum = lead.emails_sent + 1

      // Select template based on which email this is
      let template
      if (emailNum === 1) {
        template = nurtureEmail1({ email: lead.email, unsubscribeLink })
      } else if (emailNum === 2) {
        template = nurtureEmail2({ email: lead.email, unsubscribeLink })
      } else {
        template = nurtureEmail3({ email: lead.email, unsubscribeLink })
      }

      await sendEmail({
        to: lead.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
        type: `nurture_${emailNum}` as any,
        metadata: { leadId: lead.id, emailNum },
      })

      // Calculate next email date
      // Email 1 (Day 7) → Email 2 at Day 21 (14 days later)
      // Email 2 (Day 21) → Email 3 at Day 42 (21 days later)
      // Email 3 → done (set status to completed)
      let nextEmailAt: string | null = null
      let newStatus = 'active'

      if (emailNum === 1) {
        const next = new Date(now)
        next.setDate(next.getDate() + 14)
        nextEmailAt = next.toISOString()
      } else if (emailNum === 2) {
        const next = new Date(now)
        next.setDate(next.getDate() + 21)
        nextEmailAt = next.toISOString()
      } else {
        // All 3 emails sent
        newStatus = 'completed'
      }

      // Update lead
      await supabase
        .from('nurture_leads')
        .update({
          emails_sent: emailNum,
          last_email_at: now.toISOString(),
          next_email_at: nextEmailAt,
          status: newStatus,
        })
        .eq('id', lead.id)

      sentCount++
    } catch (err) {
      errors.push(`Error sending to ${lead.email}: ${err}`)
    }
  }

  console.log(`[nurture] Sent ${sentCount} nurture emails`)
  if (errors.length > 0) {
    console.error('[nurture] Errors:', errors)
  }

  return NextResponse.json({
    message: `Sent ${sentCount} nurture emails`,
    count: sentCount,
    errors: errors.length > 0 ? errors : undefined,
  })
}
