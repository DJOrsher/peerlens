import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-white">
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
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-6 py-16 sm:py-24">
        <div className="max-w-3xl text-center">
          <div className="mb-6 inline-block rounded-full bg-primary-100 px-4 py-1 text-sm font-medium text-primary-700">
            For Product Managers
          </div>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">
            What would your colleagues say about you?
          </h1>
          <p className="mt-6 text-lg text-gray-600 sm:text-xl">
            Find out—anonymously. Get honest feedback from peers to identify blind spots and accelerate your growth as a PM.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="w-full rounded-lg bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-primary-700 sm:w-auto"
            >
              Start Your Feedback Cycle
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Takes 5 minutes to set up. Get results in days.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="border-t bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">How it works</h2>
          <p className="mt-4 text-center text-gray-600">
            Three simple steps to honest feedback
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Rate yourself</h3>
              <p className="mt-2 text-gray-600">
                Assess your skills across 6 key PM competencies. This becomes your baseline.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Invite peers</h3>
              <p className="mt-2 text-gray-600">
                Send to 5-8 colleagues who know your work. Anonymous or named—your choice.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Discover gaps</h3>
              <p className="mt-2 text-gray-600">
                Compare how you see yourself vs. how others see you. Find your blind spots.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills section */}
      <div className="border-t bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            Get feedback on what matters
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Six core competencies that define PM excellence
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Discovery & User Understanding', desc: 'How well you understand customers' },
              { name: 'Prioritization & Roadmap', desc: 'Quality of your trade-off decisions' },
              { name: 'Execution & Delivery', desc: 'Getting things shipped' },
              { name: 'Communication', desc: 'Clarity, frequency, right audience' },
              { name: 'Stakeholder Management', desc: 'Managing up, across, and down' },
              { name: 'Technical Fluency', desc: 'Working effectively with engineering' },
            ].map((skill) => (
              <div key={skill.name} className="rounded-lg border bg-white p-4">
                <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why anonymous */}
      <div className="border-t bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Why anonymous feedback?
          </h2>
          <p className="mt-6 text-lg text-gray-600">
            People are more honest when there's no fear of consequences. Anonymous feedback reveals what colleagues really think—the good, the bad, and the growth opportunities.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border bg-gray-50 p-6 text-left">
              <h3 className="font-semibold text-gray-900">Anonymous mode</h3>
              <p className="mt-2 text-sm text-gray-600">
                All feedback is pooled and shuffled. You'll never know who said what—just the patterns.
              </p>
            </div>
            <div className="rounded-lg border bg-gray-50 p-6 text-left">
              <h3 className="font-semibold text-gray-900">Named mode</h3>
              <p className="mt-2 text-sm text-gray-600">
                See who gave which feedback. Great for deeper follow-up conversations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t bg-primary-600 px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to see yourself through others' eyes?
          </h2>
          <p className="mt-4 text-primary-100">
            The gap between self-perception and reality is where growth happens.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-primary-600 transition-colors hover:bg-primary-50"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          <p>PeerLens — Peer feedback for Product Managers</p>
        </div>
      </footer>
    </main>
  )
}
