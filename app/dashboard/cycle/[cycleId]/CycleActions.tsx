'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendInvitations, concludeCycle } from '@/lib/actions/cycles'

interface Props {
  cycleId: string
  cycleStatus: string
  responsesCount: number
  hasUnsentInvitations: boolean
  invitationEmails: string[]
  requesterName?: string
}

export function CycleActions({
  cycleId,
  cycleStatus,
  responsesCount,
  hasUnsentInvitations,
  invitationEmails,
  requesterName = 'A colleague'
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showTemplate, setShowTemplate] = useState(false)
  const [showConcludeConfirm, setShowConcludeConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const isConcluded = cycleStatus === 'concluded'

  const feedbackUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/respond/${cycleId}`
    : `/respond/${cycleId}`

  const emailTemplate = `Hi,

${requesterName} is collecting peer feedback as part of their professional development. They've asked you to participate because they value your perspective.

Your feedback will help them understand how they can continue to grow and improve.

Click here to provide feedback: ${feedbackUrl}

It should only take about 10 minutes. Thank you for your time!

Best regards,
PeerLens`

  async function handleSendInvitations() {
    if (!hasUnsentInvitations) {
      setMessage({ type: 'error', text: 'No unsent invitations to send' })
      return
    }

    startTransition(async () => {
      const result = await sendInvitations(cycleId)

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        return
      }

      setMessage({
        type: 'success',
        text: `Invitations marked as sent for ${result.count} peer${result.count === 1 ? '' : 's'}!`
      })

      router.refresh()
    })
  }

  function handleCopyTemplate() {
    navigator.clipboard.writeText(emailTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleConclude() {
    startTransition(async () => {
      const result = await concludeCycle(cycleId)

      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        setShowConcludeConfirm(false)
        return
      }

      setMessage({ type: 'success', text: 'Cycle concluded! You can now view your report.' })
      setShowConcludeConfirm(false)
      router.refresh()
    })
  }

  // Show "View Report" button if concluded
  if (isConcluded) {
    return (
      <div className="mt-8 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-6">
        <div>
          <h3 className="font-semibold text-green-900">Feedback cycle complete!</h3>
          <p className="text-sm text-green-700">
            You received {responsesCount} response{responsesCount !== 1 ? 's' : ''}. View your report to see the results.
          </p>
        </div>
        <Link
          href={`/report/${cycleId}`}
          className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700"
        >
          View Report
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Collect feedback actions */}
      <div className="mt-8 flex items-center justify-between rounded-lg border bg-white p-6">
        <div>
          <h3 className="font-semibold text-gray-900">Ready to collect feedback?</h3>
          <p className="text-sm text-gray-500">
            Send invitations to your peers or get a template to send yourself.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowTemplate(true)}
            className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Get template
          </button>
          <button
            type="button"
            onClick={handleSendInvitations}
            disabled={isPending || !hasUnsentInvitations}
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Send invitations'}
          </button>
        </div>
      </div>

      {/* Conclude cycle section */}
      <div className="mt-4 flex items-center justify-between rounded-lg border bg-white p-6">
        <div>
          <h3 className="font-semibold text-gray-900">Done collecting feedback?</h3>
          <p className="text-sm text-gray-500">
            Conclude your cycle to view your feedback report.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowConcludeConfirm(true)}
          disabled={isPending}
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Conclude cycle
        </button>
      </div>

      {message && (
        <div className={`mt-4 rounded-lg p-4 text-sm ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700'
            : 'bg-red-50 text-red-600'
        }`}>
          {message.text}
        </div>
      )}

      {/* Template Modal */}
      {showTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Email Template</h3>
              <button
                type="button"
                onClick={() => setShowTemplate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Copy this template and send it to your peers:
            </p>

            {invitationEmails.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">Send to:</p>
                <p className="mt-1 text-sm text-gray-600">{invitationEmails.join(', ')}</p>
              </div>
            )}

            <div className="mt-4 rounded-lg border bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{emailTemplate}</pre>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
              >
                {copied ? 'Copied!' : 'Copy template'}
              </button>
              <button
                type="button"
                onClick={() => setShowTemplate(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conclude Confirmation Modal */}
      {showConcludeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Conclude feedback cycle?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Once concluded, you won&apos;t be able to collect any more responses.
              {responsesCount === 0 && (
                <span className="mt-2 block font-medium text-amber-600">
                  You haven&apos;t received any responses yet. Your report will be empty.
                </span>
              )}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConcludeConfirm(false)}
                disabled={isPending}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConclude}
                disabled={isPending}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isPending ? 'Concluding...' : 'Conclude & View Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
