import { requireAuth } from '@/lib/actions/auth'
import { getCycleWithDetails } from '@/lib/actions/cycles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PM_SKILLS, SKILL_RATING_OPTIONS } from '@/types/database'

interface Props {
  params: Promise<{ cycleId: string }>
}

interface Invitation {
  id: string
  email: string
  status: string
  sent_at: string | null
  responded_at: string | null
  reminder_count: number
}

interface CustomQuestion {
  id: string
  question_text: string
}

export default async function CycleDetailPage({ params }: Props) {
  await requireAuth()
  const { cycleId } = await params

  const cycle = await getCycleWithDetails(cycleId)
  if (!cycle) {
    notFound()
  }

  const invitations = (cycle.invitations || []) as Invitation[]
  const selfAssessment = cycle.self_assessment
  const customQuestions = (cycle.custom_questions || []) as CustomQuestion[]

  // Response counts
  const responseCount = cycle.responses_count || 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-primary-600">
            PeerLens
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Cycle header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Feedback Cycle
              </h1>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${
                cycle.mode === 'anonymous'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {cycle.mode === 'anonymous' ? 'Anonymous' : 'Named'}
              </span>
            </div>
            <p className="mt-1 text-gray-500">
              Created {new Date(cycle.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm font-medium ${
            cycle.status === 'concluded'
              ? 'bg-green-100 text-green-700'
              : cycle.status === 'active'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {cycle.status === 'concluded'
              ? 'Completed'
              : cycle.status === 'active'
              ? 'Collecting responses'
              : 'Pending'}
          </div>
        </div>

        {/* Response progress */}
        <div className="mt-8 rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Responses</h2>
            <span className="text-2xl font-bold text-primary-600">
              {cycle.responses_count} of {invitations.length}
            </span>
          </div>
          {invitations.length > 0 && (
            <div className="mt-4">
              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all"
                  style={{ width: `${(cycle.responses_count / invitations.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Invitations list */}
        <div className="mt-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Invitations</h2>
            <Link
              href={`/start/${cycleId}/invite`}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              + Add more
            </Link>
          </div>

          {invitations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No invitations yet.</p>
              <Link
                href={`/start/${cycleId}/invite`}
                className="mt-2 inline-block font-medium text-primary-600 hover:text-primary-700"
              >
                Add invitations to get started
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      invitation.status === 'responded'
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      {invitation.status === 'responded' ? (
                        <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{invitation.email}</p>
                      <p className="text-sm text-gray-500">
                        {invitation.status === 'responded'
                          ? `Responded ${invitation.responded_at ? new Date(invitation.responded_at).toLocaleDateString() : ''}`
                          : invitation.sent_at
                          ? `Sent ${new Date(invitation.sent_at).toLocaleDateString()}`
                          : 'Not sent yet'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitation.status === 'pending' && !invitation.sent_at && (
                      <span className="text-sm text-gray-500">
                        Ready to send
                      </span>
                    )}
                    {invitation.reminder_count > 0 && (
                      <span className="text-xs text-gray-400">
                        {invitation.reminder_count} reminder{invitation.reminder_count > 1 ? 's' : ''} sent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Self-assessment summary */}
        {selfAssessment && (
          <div className="mt-6 rounded-lg border bg-white">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Your Self-Assessment</h2>
            </div>
            <div className="divide-y">
              {PM_SKILLS.map((skill) => {
                const rating = (selfAssessment.skill_ratings as Record<string, string>)?.[skill.id]
                const ratingLabel = SKILL_RATING_OPTIONS.find(o => o.value === rating)?.label || 'Not rated'

                return (
                  <div key={skill.id} className="flex items-center justify-between px-6 py-3">
                    <span className="text-gray-700">{skill.name}</span>
                    <span className="font-medium text-gray-900">{ratingLabel}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Custom questions */}
        {customQuestions.length > 0 && (
          <div className="mt-6 rounded-lg border bg-white">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Custom Questions</h2>
            </div>
            <div className="divide-y">
              {customQuestions.map((q, i) => (
                <div key={q.id} className="px-6 py-3">
                  <span className="text-gray-700">{i + 1}. {q.question_text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between rounded-lg border bg-white p-6">
          <div>
            <h3 className="font-semibold text-gray-900">Ready to collect feedback?</h3>
            <p className="text-sm text-gray-500">
              Send invitations to your peers or get a template to send yourself.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Get template
            </button>
            <button
              className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
            >
              Send invitations
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
