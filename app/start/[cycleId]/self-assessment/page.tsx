import { requireAuth } from '@/lib/actions/auth'
import { getCycle, getSelfAssessment } from '@/lib/actions/cycles'
import { getDefaultTemplate } from '@/lib/actions/templates'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { SelfAssessmentWizard } from './SelfAssessmentWizard'

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

  // Get template questions (for now, always use PM template)
  const template = await getDefaultTemplate()
  if (!template || template.questions.length === 0) {
    // Fallback error state
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">Template not found</h1>
          <p className="mt-2 text-gray-600">Please run the database migration to add skill templates.</p>
        </div>
      </main>
    )
  }

  const existingAssessment = await getSelfAssessment(cycleId)
  const selfAssessmentQuestions = template.questions.filter(q => q.use_for_self_assessment)

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

      {/* Content */}
      <SelfAssessmentWizard
        cycleId={cycleId}
        questions={selfAssessmentQuestions}
        existingRatings={existingAssessment?.skill_ratings as Record<string, string> | undefined}
      />
    </main>
  )
}
