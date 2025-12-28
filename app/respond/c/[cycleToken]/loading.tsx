export default function SharedRespondLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* Progress skeleton */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-2 w-full animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Content skeleton */}
        <div className="rounded-xl border bg-white p-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-6 space-y-4">
            <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                  <div>
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="mt-1 h-4 w-48 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation skeleton */}
        <div className="mt-8 flex items-center justify-between">
          <div className="h-12 w-24 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-12 w-24 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </main>
  )
}
