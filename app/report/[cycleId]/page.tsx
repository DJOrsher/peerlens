import { requireAuth } from '@/lib/actions/auth'
import { getReport } from '@/lib/actions/report'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { AnonymousReportView } from './AnonymousReport'
import { NamedReportView } from './NamedReport'

interface Props {
  params: Promise<{ cycleId: string }>
}

export default async function ReportPage({ params }: Props) {
  await requireAuth()
  const { cycleId } = await params

  const result = await getReport(cycleId)

  if (result.error === 'Cycle not found') {
    notFound()
  }

  if (result.error === 'Cycle is not concluded yet') {
    redirect(`/dashboard/cycle/${cycleId}`)
  }

  if (result.error || !result.report) {
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{result.error || 'Failed to load report'}</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const { report } = result

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
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Feedback Report</h1>
          <p className="mt-2 text-gray-600">
            {report.responses_count} of {report.invitations_count} peers responded
            {report.mode === 'anonymous' && ' • Anonymous feedback'}
            {report.mode === 'named' && ' • Named feedback'}
          </p>
        </div>

        {/* Empty state */}
        {report.responses_count === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">No responses received</h2>
            <p className="mt-2 text-gray-600">
              Unfortunately, none of your peers responded to this feedback request.
              Consider trying again with different peers or a different approach.
            </p>
            <Link
              href="/start"
              className="mt-6 inline-block rounded-lg bg-primary-600 px-6 py-2 font-medium text-white hover:bg-primary-700"
            >
              Start New Cycle
            </Link>
          </div>
        ) : report.mode === 'anonymous' ? (
          <AnonymousReportView report={report} />
        ) : (
          <NamedReportView report={report} />
        )}
      </div>
    </main>
  )
}
