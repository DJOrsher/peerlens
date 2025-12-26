import { requireAuth } from '@/lib/actions/auth'
import { getCycle, getSelfAssessment } from '@/lib/actions/cycles'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { SelfAssessmentForm } from './SelfAssessmentForm'

interface Props {
  params: Promise<{ cycleId: string }>
}

export default async function SelfAssessmentPage({ params }: Props) {
  await requireAuth()
  const { cycleId } = await params

  const cycle = await getCycle(cycleId)
  if (!cycle) {
    notFound()
  }

  const existingAssessment = await getSelfAssessment(cycleId)

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
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
              1
            </span>
            <span className="font-medium text-gray-900">Self-assessment</span>
            <span className="text-gray-300">→</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-500">
              2
            </span>
            <span className="text-gray-500">Invite peers</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Rate yourself honestly
          </h1>
          <p className="mt-2 text-gray-600">
            This is just for comparison—no one else sees your self-ratings.
            Be honest so you can spot the gaps between self-perception and peer perception.
          </p>
        </div>

        <SelfAssessmentForm
          cycleId={cycleId}
          existingRatings={existingAssessment?.skill_ratings as Record<string, string> | undefined}
        />
      </div>
    </main>
  )
}
