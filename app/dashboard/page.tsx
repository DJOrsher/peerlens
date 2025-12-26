import { requireAuth } from '@/lib/actions/auth'
import { signOut } from '@/lib/actions/auth'
import { getUserCycles } from '@/lib/actions/cycles'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await requireAuth()
  const cycles = await getUserCycles()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-xl font-bold text-primary-600">
            PeerLens
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your feedback cycles</p>
          </div>
          <Link
            href="/start"
            className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Start feedback cycle
          </Link>
        </div>

        {cycles.length === 0 ? (
          /* Empty state */
          <div className="mt-12 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No feedback cycles yet
            </h3>
            <p className="mt-2 text-gray-500">
              Start your first feedback cycle to discover how your colleagues perceive you.
            </p>
            <div className="mt-6">
              <Link
                href="/start"
                className="inline-flex items-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Start feedback cycle
              </Link>
            </div>
          </div>
        ) : (
          /* Cycles list */
          <div className="mt-8 space-y-4">
            {cycles.map((cycle) => {
              const invitationsCount = (cycle.invitations as { count: number }[])?.[0]?.count || 0

              return (
                <Link
                  key={cycle.id}
                  href={`/dashboard/cycle/${cycle.id}`}
                  className="block rounded-lg border bg-white p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        cycle.status === 'concluded'
                          ? 'bg-green-100'
                          : cycle.status === 'active'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}>
                        {cycle.status === 'concluded' ? (
                          <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : cycle.status === 'active' ? (
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            Feedback Cycle
                          </h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            cycle.mode === 'anonymous'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {cycle.mode === 'anonymous' ? 'Anonymous' : 'Named'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Created {new Date(cycle.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {cycle.responses_count} of {invitationsCount}
                      </div>
                      <p className="text-sm text-gray-500">responses</p>
                    </div>
                  </div>

                  {/* Status bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${
                        cycle.status === 'concluded'
                          ? 'text-green-600'
                          : cycle.status === 'active'
                          ? 'text-blue-600'
                          : 'text-amber-600'
                      }`}>
                        {cycle.status === 'concluded'
                          ? 'Completed'
                          : cycle.status === 'active'
                          ? 'Collecting responses'
                          : invitationsCount === 0
                          ? 'Add invitations to continue'
                          : 'Ready to send invitations'}
                      </span>
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
