import { requireAuth } from '@/lib/actions/auth'
import { createCycle } from '@/lib/actions/cycles'
import { getUserCredits } from '@/lib/actions/credits'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StartPageClient } from './StartPageClient'

export default async function StartPage() {
  await requireAuth()
  const credits = await getUserCredits()

  async function handleModeSelection(formData: FormData) {
    'use server'
    const mode = formData.get('mode') as 'anonymous' | 'named'
    const result = await createCycle(mode)

    if (result.error) {
      if (result.error === 'Not enough credits') {
        redirect('/start?error=no_credits')
      }
      redirect('/start?error=failed')
    }

    redirect(`/start/${result.cycle!.id}/self-assessment`)
  }

  return (
    <StartPageClient currentCredits={credits}>
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
            <Link href="/dashboard" className="text-xl font-bold text-primary-600">
              PeerLens
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Start a feedback cycle
            </h1>
            <p className="mt-3 text-lg text-gray-600">
              Choose how you want to receive feedback from your peers.
            </p>
          </div>

          {/* Mode Selection */}
          <div className="mt-10 space-y-4">
            {/* Anonymous Mode */}
            <form action={handleModeSelection}>
              <input type="hidden" name="mode" value="anonymous" />
              <button
                type="submit"
                className="w-full rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-primary-300 hover:shadow-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
                    <svg
                      className="h-6 w-6 text-primary-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Anonymous
                      </h3>
                      <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                        Recommended
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">
                      Responses are pooled together. You&apos;ll see patterns and themes,
                      but not who said what. This encourages more honest feedback.
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-500">
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Higher response rates
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        More candid feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Best for identifying blind spots
                      </li>
                    </ul>
                  </div>
                </div>
              </button>
            </form>

            {/* Named Mode */}
            <form action={handleModeSelection}>
              <input type="hidden" name="mode" value="named" />
              <button
                type="submit"
                className="w-full rounded-xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-gray-300 hover:shadow-md focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <svg
                      className="h-6 w-6 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">Named</h3>
                    <p className="mt-1 text-gray-600">
                      You&apos;ll see who gave each response. Responders can optionally
                      add an anonymous note if there&apos;s something sensitive.
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-500">
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Follow up on specific feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Context from relationship
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        May get less candid feedback
                      </li>
                    </ul>
                  </div>
                </div>
              </button>
            </form>
          </div>

          {/* Privacy Note */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Your self-ratings are never shared with respondents.
          </p>
        </div>
      </main>
    </StartPageClient>
  )
}
