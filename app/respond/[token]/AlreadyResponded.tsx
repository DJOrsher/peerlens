import Link from 'next/link'

interface Props {
  requesterName: string
}

export function AlreadyResponded({ requesterName }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Already submitted</h1>
        <p className="mt-3 text-gray-600">
          You&apos;ve already submitted feedback for {requesterName}. Thank you for your response!
        </p>

        {/* CTA */}
        <div className="mt-8 rounded-lg border bg-white p-6 text-left">
          <h3 className="font-semibold text-gray-900">
            Want feedback about yourself?
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            If 5 colleagues filled this out about you, what would they say?
          </p>
          <Link
            href="/start"
            className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 font-semibold text-white hover:bg-primary-700"
          >
            Start your own feedback cycle
          </Link>
        </div>
      </div>
    </main>
  )
}
