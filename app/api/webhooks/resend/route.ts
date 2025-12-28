import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createServiceClient } from '@/lib/supabase/server'
import { logEmailEvent, notifyAdmin } from '@/lib/resend'

export async function POST(req: Request) {
  const body = await req.text()
  const headerPayload = await headers()

  // Get Svix headers for verification
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('Missing Svix headers')
    return new Response('Missing headers', { status: 400 })
  }

  // Verify webhook signature
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('RESEND_WEBHOOK_SECRET not configured')
    return new Response('Server configuration error', { status: 500 })
  }

  const wh = new Webhook(webhookSecret)
  let event: ResendWebhookEvent

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ResendWebhookEvent
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const { type, data } = event
  const recipientEmail = data.to?.[0]
  const emailType = data.tags?.find((t) => t.name === 'type')?.value

  console.log(`Resend webhook: ${type} for ${recipientEmail}`)

  // Map Resend event types to our types
  const eventMap: Record<string, string> = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
    'email.bounced': 'bounced',
    'email.complained': 'complained',
  }

  const eventType = eventMap[type]
  if (!eventType) {
    // Unknown event type, just acknowledge
    return new Response('OK')
  }

  // Log the event
  if (recipientEmail && emailType) {
    await logEmailEvent(recipientEmail, emailType as any, eventType, data)
  }

  // Handle bounces
  if (eventType === 'bounced' && recipientEmail) {
    await handleBounce(recipientEmail, data)
  }

  // Handle spam complaints (serious!)
  if (eventType === 'complained' && recipientEmail) {
    await handleComplaint(recipientEmail, data)
  }

  return new Response('OK')
}

async function handleBounce(email: string, data: ResendWebhookData) {
  const supabase = createServiceClient()

  // Mark invitation as bounced
  await supabase
    .from('invitations')
    .update({ status: 'bounced' })
    .eq('email', email)
    .eq('status', 'pending')

  // Remove from nurture sequence
  await supabase
    .from('nurture_leads')
    .update({ status: 'unsubscribed' })
    .eq('email', email)
    .eq('status', 'active')

  // Notify admin
  await notifyAdmin('email_bounced', {
    email,
    reason: data.bounce?.message || 'Unknown',
    bounce_type: data.bounce?.type,
  })
}

async function handleComplaint(email: string, data: ResendWebhookData) {
  const supabase = createServiceClient()

  // Remove from all future emails immediately
  await supabase
    .from('nurture_leads')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('email', email)

  // This is serious - notify admin immediately
  await notifyAdmin('spam_complaint', {
    email,
    data,
    severity: 'HIGH',
    action_required: 'Review email content and sending practices',
  })
}

// Type definitions for Resend webhook events
interface ResendWebhookEvent {
  type: string
  data: ResendWebhookData
}

interface ResendWebhookData {
  to?: string[]
  from?: string
  subject?: string
  tags?: Array<{ name: string; value: string }>
  bounce?: {
    message?: string
    type?: string
  }
  [key: string]: unknown
}
