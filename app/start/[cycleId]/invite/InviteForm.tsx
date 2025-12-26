'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addInvitations } from '@/lib/actions/cycles'

interface Props {
  cycleId: string
  existingEmails: string[]
}

export function InviteForm({ cycleId, existingEmails }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [emails, setEmails] = useState<string[]>(() => {
    // Start with existing emails or 3 empty slots
    if (existingEmails.length > 0) {
      return existingEmails
    }
    return ['', '', '']
  })

  const validEmails = emails.filter(e => e.trim() && e.includes('@'))
  const canSubmit = validEmails.length >= 3

  function addEmailField() {
    if (emails.length < 10) {
      setEmails([...emails, ''])
    }
  }

  function removeEmailField(index: number) {
    if (emails.length > 3) {
      setEmails(emails.filter((_, i) => i !== index))
    } else {
      // Just clear the field if we're at minimum
      const newEmails = [...emails]
      newEmails[index] = ''
      setEmails(newEmails)
    }
  }

  function updateEmail(index: number, value: string) {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!canSubmit) {
      setError('Please add at least 3 email addresses')
      return
    }

    // Filter out existing emails to only add new ones
    const newEmails = validEmails.filter(
      email => !existingEmails.includes(email.toLowerCase().trim())
    )

    startTransition(async () => {
      if (newEmails.length > 0) {
        const result = await addInvitations(cycleId, newEmails)
        if (result.error) {
          setError(result.error)
          return
        }
      }

      // Navigate to dashboard (cycle is created and ready)
      router.push('/dashboard')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-lg border bg-white p-6">
        <div className="space-y-3">
          {emails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder={`colleague${index + 1}@company.com`}
                  className={`w-full rounded-lg border px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 ${
                    email && !email.includes('@')
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                />
                {email && email.includes('@') && (
                  <svg
                    className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeEmailField(index)}
                className="rounded-lg border border-gray-300 p-2.5 text-gray-400 hover:border-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {emails.length < 10 && (
          <button
            type="button"
            onClick={addEmailField}
            className="mt-4 flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add another email
          </button>
        )}
      </div>

      {/* Counter and submit */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {validEmails.length} of 10 invitations
          {validEmails.length < 3 && (
            <span className="ml-1 text-amber-600">(minimum 3 required)</span>
          )}
        </p>
        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Creating...' : 'Create feedback cycle'}
        </button>
      </div>

      {/* Note about emails */}
      <p className="text-center text-sm text-gray-500">
        Invitations won&apos;t be sent automatically. You&apos;ll be able to send them from your dashboard.
      </p>
    </form>
  )
}
