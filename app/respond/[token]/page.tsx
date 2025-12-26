import { getInvitationByToken, getTemplateQuestionsForResponder, getCustomQuestionsForCycle } from '@/lib/actions/respond'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { RespondWizard } from './RespondWizard'
import { AlreadyResponded } from './AlreadyResponded'

interface Props {
  params: Promise<{ token: string }>
}

export default async function RespondPage({ params }: Props) {
  const { token } = await params

  const invitation = await getInvitationByToken(token)

  // Invalid or not found token
  if (!invitation) {
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

  // Already submitted
  if (invitation.has_responded) {
    return <AlreadyResponded requesterName={invitation.cycle.user_name || invitation.cycle.user_email} />
  }

  // Get template questions and custom questions
  const [questions, customQuestions] = await Promise.all([
    getTemplateQuestionsForResponder(invitation.cycle.template_id),
    getCustomQuestionsForCycle(invitation.cycle.id),
  ])

  const requesterName = invitation.cycle.user_name || invitation.cycle.user_email.split('@')[0]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <span className="text-xl font-bold text-primary-600">PeerLens</span>
        </div>
      </header>

      {/* Content */}
      <RespondWizard
        invitationId={invitation.id}
        requesterName={requesterName}
        cycleMode={invitation.cycle.mode}
        questions={questions}
        customQuestions={customQuestions}
      />
    </main>
  )
}
