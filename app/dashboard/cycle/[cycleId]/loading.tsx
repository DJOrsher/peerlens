export default function CycleDetailLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Title skeleton */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="mt-2 h-5 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-8 w-28 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Progress skeleton */}
        <div className="mt-6 rounded-lg border bg-white p-6">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Share link skeleton */}
        <div className="mt-6 rounded-lg border bg-white p-6">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-3 h-10 w-full animate-pulse rounded bg-gray-200" />
        </div>

        {/* Invitations skeleton */}
        <div className="mt-6 rounded-lg border bg-white">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="mt-8 flex justify-end gap-4">
          <div className="h-12 w-32 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-12 w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </main>
  )
}
