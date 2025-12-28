import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

const CRON_SECRET = process.env.CRON_SECRET

/**
 * Expire pending invitations older than 30 days
 * Runs daily via Vercel cron
 */
export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Find invitations that are:
  // - status = 'pending'
  // - created_at < 30 days ago
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('status', 'pending')
    .lt('created_at', thirtyDaysAgo.toISOString())
    .select('id')

  if (error) {
    console.error('[expire-invitations] Failed to expire invitations:', error)
    return NextResponse.json({ error: 'Failed to expire invitations' }, { status: 500 })
  }

  const count = data?.length || 0
  console.log(`[expire-invitations] Expired ${count} invitations`)

  return NextResponse.json({
    message: `Expired ${count} invitations`,
    count,
  })
}
