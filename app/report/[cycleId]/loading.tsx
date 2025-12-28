export default function ReportLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Title skeleton */}
        <div className="mb-8">
          <div className="h-8 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Self-assessment comparison skeleton */}
        <div className="rounded-lg border bg-white p-6">
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                <div className="flex gap-4">
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback sections skeleton */}
        <div className="mt-6 space-y-6">
          <div className="rounded-lg border bg-white p-6">
            <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="rounded-lg border bg-white p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
