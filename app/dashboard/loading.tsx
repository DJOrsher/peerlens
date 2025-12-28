export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
          <div className="flex items-center gap-4">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </header>

      {/* Main content skeleton */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-5 w-56 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-12 w-48 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Cycle cards skeleton */}
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border bg-white p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                  <div>
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-4 h-4 w-40 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
