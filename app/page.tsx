import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-xl font-bold text-primary-600">PeerLens</span>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="max-w-3xl text-center">
          <h1 className="text-5xl font-bold leading-tight text-gray-900 sm:text-6xl">
            What would your colleagues say about you?
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Find out—anonymously. Get honest feedback from peers to identify blind spots and accelerate your growth.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-block rounded-lg bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Get Started
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Free to respond. $50 to request your own feedback.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="border-t bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Rate yourself</h3>
              <p className="mt-2 text-sm text-gray-600">
                Assess your skills across 6 key areas
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Invite peers</h3>
              <p className="mt-2 text-sm text-gray-600">
                Send to 3-8 colleagues who know your work
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">Get insights</h3>
              <p className="mt-2 text-sm text-gray-600">
                Compare self-perception to peer perception
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}