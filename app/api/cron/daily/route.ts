import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { noResponsesEmail, nurtureEmail1, nurtureEmail2, nurtureEmail3 } from '@/lib/emails/templates'

// Combined daily cron job that handles:
// 1. Auto-conclude cycles with 0 responses after 5 days
// 2. Expire pending invitations after 30 days
// 3. Send nurture email sequence

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    autoConclude: { processed: 0, errors: 0 },
    expireInvitations: { processed: 0, errors: 0 },
    nurture: { sent: 0, errors: 0 },
  }

  const supabase = await createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // ============================================
  // 1. AUTO-CONCLUDE CYCLES (5 days, 0 responses)
  // ============================================
  try {
    const fiveDaysAgo = new Date()
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)

    // Find active cycles with 0 responses created more than 5 days ago
    const { data: staleCycles, error: fetchError } = await supabase
      .from('feedback_cycles')
      .select(`
        id,
        user_id,
        users!inner(email, name)
      `)
      .eq('status', 'active')
      .eq('responses_count', 0)
      .lt('created_at', fiveDaysAgo.toISOString())

    if (fetchError) {
      console.error('Error fetching stale cycles:', fetchError)
      results.autoConclude.errors++
    } else if (staleCycles && staleCycles.length > 0) {
      for (const cycle of staleCycles) {
        try {
          // Conclude the cycle
          const { error: updateError } = await supabase
            .from('feedback_cycles')
            .update({ status: 'concluded' })
            .eq('id', cycle.id)

          if (updateError) {
            console.error(`Error concluding cycle ${cycle.id}:`, updateError)
            results.autoConclude.errors++
            continue
          }

          // Send no-responses email
          const user = cycle.users as unknown as { email: string; name: string | null }
          const emailContent = noResponsesEmail({
            userName: user.name || 'there',
            dashboardLink: `${appUrl}/start`,
          })

          await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            type: 'no_responses',
            metadata: { cycleId: cycle.id },
          })

          results.autoConclude.processed++
        } catch (err) {
          console.error(`Error processing cycle ${cycle.id}:`, err)
          results.autoConclude.errors++
        }
      }
    }
  } catch (err) {
    console.error('Auto-conclude error:', err)
    results.autoConclude.errors++
  }

  // ============================================
  // 2. EXPIRE INVITATIONS (30 days)
  // ============================================
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: expiredInvitations, error: expireError } = await supabase
      .from('invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('created_at', thirtyDaysAgo.toISOString())
      .select('id')

    if (expireError) {
      console.error('Error expiring invitations:', expireError)
      results.expireInvitations.errors++
    } else {
      results.expireInvitations.processed = expiredInvitations?.length || 0
    }
  } catch (err) {
    console.error('Expire invitations error:', err)
    results.expireInvitations.errors++
  }

  // ============================================
  // 3. NURTURE EMAIL SEQUENCE
  // ============================================
  try {
    const now = new Date()

    // Find leads ready for their next email
    const { data: leadsToNurture, error: fetchLeadsError } = await supabase
      .from('nurture_leads')
      .select('*')
      .eq('status', 'active')
      .lt('next_email_at', now.toISOString())
      .lt('emails_sent', 3)

    if (fetchLeadsError) {
      console.error('Error fetching nurture leads:', fetchLeadsError)
      results.nurture.errors++
    } else if (leadsToNurture && leadsToNurture.length > 0) {
      for (const lead of leadsToNurture) {
        try {
          const unsubscribeLink = `${appUrl}/unsubscribe/${lead.id}`

          let emailContent: { subject: string; html: string; text: string }
          let emailType: 'nurture_1' | 'nurture_2' | 'nurture_3'

          // Determine which email to send based on emails_sent count
          switch (lead.emails_sent) {
            case 0:
              emailContent = nurtureEmail1({
                email: lead.email,
                unsubscribeLink,
              })
              emailType = 'nurture_1'
              break
            case 1:
              emailContent = nurtureEmail2({
                email: lead.email,
                unsubscribeLink,
              })
              emailType = 'nurture_2'
              break
            case 2:
              emailContent = nurtureEmail3({
                email: lead.email,
                unsubscribeLink,
              })
              emailType = 'nurture_3'
              break
            default:
              continue
          }

          // Send the email
          await sendEmail({
            to: lead.email,
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
            type: emailType,
            metadata: { leadId: lead.id },
          })

          // Calculate next email date
          const nextEmailAt = new Date()
          if (lead.emails_sent === 0) {
            nextEmailAt.setDate(nextEmailAt.getDate() + 14) // 14 days until email 2
          } else if (lead.emails_sent === 1) {
            nextEmailAt.setDate(nextEmailAt.getDate() + 21) // 21 days until email 3
          }

          // Update lead
          const updateData: Record<string, unknown> = {
            emails_sent: lead.emails_sent + 1,
            last_email_at: now.toISOString(),
          }

          if (lead.emails_sent < 2) {
            updateData.next_email_at = nextEmailAt.toISOString()
          } else {
            // After 3rd email, mark as completed
            updateData.status = 'completed'
            updateData.next_email_at = null
          }

          await supabase
            .from('nurture_leads')
            .update(updateData)
            .eq('id', lead.id)

          results.nurture.sent++
        } catch (err) {
          console.error(`Error processing nurture lead ${lead.id}:`, err)
          results.nurture.errors++
        }
      }
    }
  } catch (err) {
    console.error('Nurture error:', err)
    results.nurture.errors++
  }

  console.log('Daily cron completed:', results)

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  })
}
