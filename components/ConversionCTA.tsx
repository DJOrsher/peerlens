'use client'

import { useState, useTransition } from 'react'
import { addNurtureLead } from '@/lib/actions/nurture'

interface Props {
  responderEmail?: string | null
}

export function ConversionCTA({ responderEmail }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [email, setEmail] = useState(responderEmail || '')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleRemindMe() {
    // If we already have an email, submit directly
    if (responderEmail) {
      handleSubmit()
    } else {
      setShowModal(true)
    }
  }

  function handleSubmit() {
    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await addNurtureLead(email.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setSubmitted(true)
        setShowModal(false)
      }
    })
  }

  if (submitted) {
    return (
      <div className="mt-8 rounded-lg border bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="font-medium text-green-800">
          We'll remind you in a week!
        </p>
        <p className="mt-1 text-sm text-green-700">
          Check your inbox for a reminder to start your own feedback cycle.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mt-8 rounded-lg border bg-gray-50 p-6 text-left">
        <h3 className="font-semibold text-gray-900">
          If 5 colleagues filled this out about you, what would they say?
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Discover your blind spots and get honest feedback from your peers.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/start"
            className="rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700"
          >
            Start now
          </a>
          <button
            type="button"
            onClick={handleRemindMe}
            className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Remind me later
          </button>
        </div>
      </div>

      {/* Email capture modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Get a reminder
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              We'll send you a reminder in a week to start your own feedback cycle.
            </p>

            <div className="mt-4">
              <label htmlFor="reminder-email" className="block text-sm font-medium text-gray-700 mb-1">
                Your email
              </label>
              <input
                id="reminder-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                disabled={isPending}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Remind me'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
