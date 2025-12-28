import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/resend'
import { noResponsesEmail } from '@/lib/emails/templates'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Auto-conclude cycles with 0 responses after 5 days
 * Runs daily via Vercel cron
 */
export async function GET(req: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://peerlens.app'

  // Find cycles that are:
  // - status = 'active' (invitations sent)
  // - responses_count = 0
  // - created_at < 5 days ago
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
    console.error('[auto-conclude] Failed to fetch cycles:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch cycles' }, { status: 500 })
  }

  if (!cycles || cycles.length === 0) {
    return NextResponse.json({ message: 'No cycles to conclude', count: 0 })
  }

  let concludedCount = 0
  const errors: string[] = []

  for (const cycle of cycles) {
    try {
      // Conclude the cycle
      const { error: updateError } = await supabase
        .from('feedback_cycles')
        .update({ status: 'concluded' })
        .eq('id', cycle.id)

      if (updateError) {
        errors.push(`Failed to conclude ${cycle.id}: ${updateError.message}`)
        continue
      }

      // Send no-responses email
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

      concludedCount++
    } catch (err) {
      errors.push(`Error processing ${cycle.id}: ${err}`)
    }
  }

  console.log(`[auto-conclude] Concluded ${concludedCount} cycles`)
  if (errors.length > 0) {
    console.error('[auto-conclude] Errors:', errors)
  }

  return NextResponse.json({
    message: `Concluded ${concludedCount} cycles`,
    count: concludedCount,
    errors: errors.length > 0 ? errors : undefined,
  })
}
