import { requireAuth } from '@/lib/actions/auth'
import { getCycle, getSelfAssessment, getInvitations } from '@/lib/actions/cycles'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { InviteForm } from './InviteForm'

interface Props {
  params: Promise<{ cycleId: string }>
}

export default async function InvitePage({ params }: Props) {
  await requireAuth()
  const { cycleId } = await params

  const cycle = await getCycle(cycleId)
  if (!cycle) {
    notFound()
  }

  // Ensure self-assessment is complete
  const selfAssessment = await getSelfAssessment(cycleId)
  if (!selfAssessment) {
    redirect(`/start/${cycleId}/self-assessment`)
  }

  const existingInvitations = await getInvitations(cycleId)

  return (
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
            Save & exit
          </Link>
        </div>
      </header>

      {/* Progress indicator */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-xs font-medium text-white">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-gray-500">Self-assessment</span>
            <span className="text-gray-300">→</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
              2
            </span>
            <span className="font-medium text-gray-900">Invite peers</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Invite your peers
          </h1>
          <p className="mt-2 text-gray-600">
            Choose 3-10 people who know your work. A mix of close collaborators and
            cross-functional partners works best.
          </p>
        </div>

        <InviteForm
          cycleId={cycleId}
          existingEmails={existingInvitations.map(i => i.email)}
        />

        {/* Tips */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-medium text-blue-900">Who to invite</h4>
          <ul className="mt-2 space-y-1 text-sm text-blue-800">
            <li>• People who work with you regularly (at least monthly)</li>
            <li>• People who see different aspects of your work</li>
            <li>• A close collaborator and a cross-functional partner</li>
            <li>• Someone more senior and someone more junior</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
