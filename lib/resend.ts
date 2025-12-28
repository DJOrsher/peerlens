'use server'

import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export type EmailType =
  | 'invite'
  | 'reminder'
  | 'report_ready'
  | 'no_responses'
  | 'admin_alert'

interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
  type: EmailType
  metadata?: Record<string, unknown>
}

/**
 * Send an email via Resend
 */
export async function sendEmail(params: SendEmailParams) {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'PeerLens <feedback@peerlens.app>'

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      replyTo: process.env.ADMIN_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      tags: [
        { name: 'type', value: params.type },
      ],
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error(error.message)
    }

    // Log successful send
    await logEmailEvent(params.to, params.type, 'sent', params.metadata)

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email send failed:', { to: params.to, type: params.type, error })

    // Notify admin of failure (but don't fail recursively)
    if (params.type !== 'admin_alert') {
      await notifyAdmin('email_send_failed', {
        to: params.to,
        type: params.type,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    throw error
  }
}

/**
 * Log email event to database
 */
export async function logEmailEvent(
  recipientEmail: string,
  emailType: EmailType,
  eventType: string,
  metadata?: Record<string, unknown>
) {
  try {
    const supabase = createServiceClient()
    await supabase.from('email_events').insert({
      email_type: emailType,
      recipient_email: recipientEmail,
      event_type: eventType,
      metadata: metadata || {},
    })
  } catch (error) {
    // Don't throw - logging failure shouldn't break email sending
    console.error('Failed to log email event:', error)
  }
}

type AdminAlertType =
  | 'email_send_failed'
  | 'email_bounced'
  | 'spam_complaint'
  | 'response_write_failed'
  | 'cycle_auto_concluded'

/**
 * Send alert to admin
 */
export async function notifyAdmin(type: AdminAlertType, data: Record<string, unknown>) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    console.error('[ADMIN ALERT - NO EMAIL CONFIGURED]', type, data)
    return
  }

  const subject = `[PeerLens Alert] ${type.replace(/_/g, ' ')}`
  const text = `Alert: ${type}\n\nDetails:\n${JSON.stringify(data, null, 2)}`
  const html = `
    <h2>PeerLens Alert: ${type.replace(/_/g, ' ')}</h2>
    <pre>${JSON.stringify(data, null, 2)}</pre>
  `

  try {
    await sendEmail({
      to: adminEmail,
      subject,
      html,
      text,
      type: 'admin_alert',
    })
  } catch (error) {
    // Log to console as last resort
    console.error('[ADMIN ALERT - SEND FAILED]', type, data, error)
  }
}
