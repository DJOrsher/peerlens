import { getCycleBySharedToken, getTemplateQuestionsForResponder, getCustomQuestionsForCycle } from '@/lib/actions/respond'
import Link from 'next/link'
import { SharedRespondWizard } from './SharedRespondWizard'

interface Props {
  params: Promise<{ cycleToken: string }>
}

export default async function SharedRespondPage({ params }: Props) {
  const { cycleToken } = await params

  const cycle = await getCycleBySharedToken(cycleToken)

  // Invalid or not found token
  if (!cycle) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Link not found</h1>
          <p className="mt-3 text-gray-600">
            This feedback link is invalid or has expired. Please check the link and try again.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
          >
            Go to homepage
          </Link>
        </div>
      </main>
    )
  }

  // Cycle is concluded
  if (cycle.status === 'concluded') {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Feedback period ended</h1>
          <p className="mt-3 text-gray-600">
            This feedback cycle has been concluded and is no longer accepting responses.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hover:bg-primary-700"
          >
            Go to homepage
          </Link>
        </div>
      </main>
    )
  }

  // Get template questions and custom questions
  const [questions, customQuestions] = await Promise.all([
    getTemplateQuestionsForResponder(cycle.template_id),
    getCustomQuestionsForCycle(cycle.id),
  ])

  const requesterName = cycle.user_name || cycle.user_email.split('@')[0]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <span className="text-xl font-bold text-primary-600">PeerLens</span>
        </div>
      </header>

      {/* Content */}
      <SharedRespondWizard
        cycleId={cycle.id}
        requesterName={requesterName}
        cycleMode={cycle.mode}
        questions={questions}
        customQuestions={customQuestions}
      />
    </main>
  )
}
