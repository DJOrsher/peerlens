import { requireAuth } from '@/lib/actions/auth'
import { getCycleWithDetails } from '@/lib/actions/cycles'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PM_SKILLS, SKILL_RATING_OPTIONS } from '@/types/database'
import { CycleActions } from './CycleActions'
import { ShareLink } from './ShareLink'
import { ResponseProgress } from './ResponseProgress'
import { InvitationItem } from './InvitationItem'

interface Props {
  params: Promise<{ cycleId: string }>
}

export default async function CycleDetailPage({ params }: Props) {
  await requireAuth()
  const { cycleId } = await params

  const cycle = await getCycleWithDetails(cycleId)
  if (!cycle) {
    notFound()
  }

  const { invitations, self_assessment: selfAssessment, custom_questions: customQuestions } = cycle

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
        <ResponseProgress
          cycleId={cycleId}
          initialCount={cycle.responses_count}
          totalInvitations={invitations.length}
          isActive={cycle.status === 'active'}
        />

        {/* Share link */}
        {cycle.status !== 'concluded' && (
          <ShareLink sharedToken={cycle.shared_token} />
        )}

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
                <InvitationItem
                  key={invitation.id}
                  invitation={invitation}
                  cycleStatus={cycle.status}
                />
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
        <CycleActions
          cycleId={cycleId}
          cycleStatus={cycle.status}
          responsesCount={cycle.responses_count}
          hasUnsentInvitations={invitations.some(i => !i.sent_at)}
          invitationEmails={invitations.filter(i => !i.sent_at).map(i => i.email)}
        />
      </div>
    </main>
  )
}
