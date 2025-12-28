import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { noResponsesEmail, nurtureEmail1, nurtureEmail2, nurtureEmail3 } from '@/lib/emails/templates'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Combined daily cron job that handles:
 * 1. Auto-conclude cycles with 0 responses after 5 days
 * 2. Expire pending invitations after 30 days
 * 3. Send nurture emails (Day 7, 21, 42)
 *
 * Runs daily at 10:00 UTC via Vercel cron
 * Combined into single endpoint due to Vercel free tier 2-cron limit
 */
export async function GET(req: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://peerlens.app'
  const now = new Date()

  const results = {
    autoConclude: { count: 0, errors: [] as string[] },
    expireInvitations: { count: 0, errors: [] as string[] },
    nurture: { count: 0, errors: [] as string[] },
  }

  // ============================================
  // 1. Auto-conclude cycles with 0 responses
  // ============================================
  try {
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    const { data: cycles, error: fetchError } = await supabase
      .from('feedback_cycles')
      .select(`
        id,
        user_id,
        users!inner (
          email,
          name
        )
      `)
      .eq('status', 'active')
      .eq('responses_count', 0)
      .lt('created_at', fiveDaysAgo.toISOString())

    if (fetchError) {
      results.autoConclude.errors.push(`Failed to fetch cycles: ${fetchError.message}`)
    } else if (cycles && cycles.length > 0) {
      for (const cycle of cycles) {
        try {
          const { error: updateError } = await supabase
            .from('feedback_cycles')
            .update({ status: 'concluded' })
            .eq('id', cycle.id)

          if (updateError) {
            results.autoConclude.errors.push(`Failed to conclude ${cycle.id}: ${updateError.message}`)
            continue
          }

          const user = cycle.users as unknown as { email: string; name: string | null }
          if (user?.email) {
            const template = noResponsesEmail({
              userName: user.name || '',
              dashboardLink: `${appUrl}/start`,
            })

            await sendEmail({
              to: user.email,
              subject: template.subject,
              html: template.html,
              text: template.text,
              type: 'no_responses',
              metadata: { cycleId: cycle.id },
            })
          }

          results.autoConclude.count++
        } catch (err) {
          results.autoConclude.errors.push(`Error processing ${cycle.id}: ${err}`)
        }
      }
    }
  } catch (err) {
    results.autoConclude.errors.push(`Auto-conclude failed: ${err}`)
  }

  // ============================================
  // 2. Expire old invitations
  // ============================================
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select('id')

    if (error) {
      results.expireInvitations.errors.push(`Failed to expire invitations: ${error.message}`)
    } else {
      results.expireInvitations.count = data?.length || 0
    }
  } catch (err) {
    results.expireInvitations.errors.push(`Expire invitations failed: ${err}`)
  }

  // ============================================
  // 3. Send nurture emails
  // ============================================
  try {
    const { data: leads, error: fetchError } = await supabase
      .from('nurture_leads')
      .select('*')
      .eq('status', 'active')
      .lte('next_email_at', now.toISOString())
      .lt('emails_sent', 3)

    if (fetchError) {
      results.nurture.errors.push(`Failed to fetch leads: ${fetchError.message}`)
    } else if (leads && leads.length > 0) {
      for (const lead of leads) {
        try {
          const unsubscribeLink = `${appUrl}/unsubscribe/${lead.id}`
          const emailNum = lead.emails_sent + 1

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
            type: `nurture_${emailNum}` as 'nurture_1' | 'nurture_2' | 'nurture_3',
            metadata: { leadId: lead.id, emailNum },
          })

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
            newStatus = 'completed'
          }

          await supabase
            .from('nurture_leads')
            .update({
              emails_sent: emailNum,
              last_email_at: now.toISOString(),
              next_email_at: nextEmailAt,
              status: newStatus,
            })
            .eq('id', lead.id)

          results.nurture.count++
        } catch (err) {
          results.nurture.errors.push(`Error sending to ${lead.email}: ${err}`)
        }
      }
    }
  } catch (err) {
    results.nurture.errors.push(`Nurture emails failed: ${err}`)
  }

  // Log summary
  console.log('[daily-cron] Results:', {
    autoConclude: results.autoConclude.count,
    expireInvitations: results.expireInvitations.count,
    nurture: results.nurture.count,
  })

  const hasErrors =
    results.autoConclude.errors.length > 0 ||
    results.expireInvitations.errors.length > 0 ||
    results.nurture.errors.length > 0

  if (hasErrors) {
    console.error('[daily-cron] Errors:', results)
  }

  return NextResponse.json({
    message: 'Daily cron completed',
    results: {
      autoConclude: {
        concluded: results.autoConclude.count,
        errors: results.autoConclude.errors.length > 0 ? results.autoConclude.errors : undefined,
      },
      expireInvitations: {
        expired: results.expireInvitations.count,
        errors: results.expireInvitations.errors.length > 0 ? results.expireInvitations.errors : undefined,
      },
      nurture: {
        sent: results.nurture.count,
        errors: results.nurture.errors.length > 0 ? results.nurture.errors : undefined,
      },
    },
  })
}
