import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-sans text-sm font-medium tracking-wider uppercase text-ink">PeerLens</span>
          <Link
            href="/login"
            className="btn-ghost"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 sm:py-28">
        <div className="max-w-2xl text-center">
          <p className="mb-6 font-sans text-xs tracking-widest uppercase text-subtle">
            For Product Managers
          </p>
          <h1 className="text-3xl leading-snug text-ink sm:text-4xl lg:text-5xl">
            What would your colleagues say about you?
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-subtle">
            Find out—anonymously. Get honest feedback from peers to identify blind spots and accelerate your growth.
          </p>
          <div className="mt-10">
            <Link href="/login" className="btn-primary">
              Start Your Feedback Cycle
            </Link>
          </div>
          <p className="mt-5 font-sans text-xs text-subtle">
            Takes 5 minutes to set up. Get results in days.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl text-ink">How it works</h2>
          <p className="mt-3 text-center text-subtle">
            Three simple steps to honest feedback
          </p>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <span className="font-sans text-sm font-medium text-accent">1</span>
              </div>
              <h3 className="mt-5 text-lg text-ink">Rate yourself</h3>
              <p className="mt-2 text-subtle">
                Assess your skills across 6 key PM competencies. This becomes your baseline.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <span className="font-sans text-sm font-medium text-accent">2</span>
              </div>
              <h3 className="mt-5 text-lg text-ink">Invite peers</h3>
              <p className="mt-2 text-subtle">
                Send to 5-8 colleagues who know your work. Anonymous or named—your choice.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <span className="font-sans text-sm font-medium text-accent">3</span>
              </div>
              <h3 className="mt-5 text-lg text-ink">Discover gaps</h3>
              <p className="mt-2 text-subtle">
                Compare how you see yourself vs. how others see you. Find your blind spots.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills section */}
      <div className="border-t border-border bg-primary-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl text-ink">
            Get feedback on what matters
          </h2>
          <p className="mt-3 text-center text-subtle">
            Six core competencies that define PM excellence
          </p>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Discovery & User Understanding', desc: 'How well you understand customers' },
              { name: 'Prioritization & Roadmap', desc: 'Quality of your trade-off decisions' },
              { name: 'Execution & Delivery', desc: 'Getting things shipped' },
              { name: 'Communication', desc: 'Clarity, frequency, right audience' },
              { name: 'Stakeholder Management', desc: 'Managing up, across, and down' },
              { name: 'Technical Fluency', desc: 'Working effectively with engineering' },
            ].map((skill) => (
              <div key={skill.name} className="rounded-lg border border-border bg-paper p-5 transition-shadow hover:shadow-sm">
                <h3 className="text-ink">{skill.name}</h3>
                <p className="mt-2 font-sans text-sm text-subtle">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why anonymous */}
      <div className="border-t border-border px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl text-ink">
            Why anonymous feedback?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-subtle">
            People are more honest when there is no fear of consequences. Anonymous feedback reveals what colleagues really think—the good, the bad, and the growth opportunities.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-primary-50 p-6 text-left">
              <h3 className="text-ink">Anonymous mode</h3>
              <p className="mt-2 font-sans text-sm text-subtle">
                All feedback is pooled and shuffled. You will never know who said what—just the patterns.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-primary-50 p-6 text-left">
              <h3 className="text-ink">Named mode</h3>
              <p className="mt-2 font-sans text-sm text-subtle">
                See who gave which feedback. Great for deeper follow-up conversations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border bg-accent px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl text-white">
            Ready to see yourself through others' eyes?
          </h2>
          <p className="mt-4 text-primary-300">
            The gap between self-perception and reality is where growth happens.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block rounded bg-white px-6 py-3 font-sans text-xs uppercase tracking-widest text-accent transition-colors hover:bg-primary-100"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-sans text-xs text-subtle">
            PeerLens — Peer feedback for Product Managers
          </p>
        </div>
      </footer>
    </main>
  )
}
