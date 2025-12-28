'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendReminder } from '@/lib/actions/cycles'

interface Props {
  invitation: {
    id: string
    email: string
    status: string
    sent_at: string | null
    responded_at: string | null
    reminder_count: number
  }
  cycleStatus: string
}

export function InvitationItem({ invitation, cycleStatus }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const canSendReminder =
    cycleStatus !== 'concluded' &&
    invitation.status === 'pending' &&
    invitation.sent_at &&
    invitation.reminder_count < 2

  async function handleSendReminder() {
    setMessage(null)
    startTransition(async () => {
      const result = await sendReminder(invitation.id)
      if (result.error) {
        setMessage(result.error)
      } else {
        setMessage('Reminder sent!')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            invitation.status === 'responded'
              ? 'bg-green-100'
              : invitation.status === 'bounced'
              ? 'bg-red-100'
              : 'bg-gray-100'
          }`}
        >
          {invitation.status === 'responded' ? (
            <svg
              className="h-4 w-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : invitation.status === 'bounced' ? (
            <svg
              className="h-4 w-4 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{invitation.email}</p>
          <p className="text-sm text-gray-500">
            {invitation.status === 'responded'
              ? `Responded ${
                  invitation.responded_at
                    ? new Date(invitation.responded_at).toLocaleDateString()
                    : ''
                }`
              : invitation.status === 'bounced'
              ? 'Email bounced'
              : invitation.sent_at
              ? `Sent ${new Date(invitation.sent_at).toLocaleDateString()}`
              : 'Not sent yet'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {invitation.status === 'pending' && !invitation.sent_at && (
          <span className="text-sm text-gray-500">Ready to send</span>
        )}
        {invitation.reminder_count > 0 && (
          <span className="text-xs text-gray-400">
            {invitation.reminder_count} reminder{invitation.reminder_count > 1 ? 's' : ''} sent
          </span>
        )}
        {canSendReminder && (
          <button
            type="button"
            onClick={handleSendReminder}
            disabled={isPending}
            className="rounded px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Send reminder'}
          </button>
        )}
        {message && (
          <span
            className={`text-xs ${
              message.includes('sent') ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
