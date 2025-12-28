import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <span className="text-lg italic text-ink">PeerLens</span>
          <Link href="/login" className="btn-ghost">
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-28 sm:py-36">
        <div className="max-w-2xl text-center">
          <p className="mb-10 font-sans text-[10px] tracking-[0.35em] uppercase text-subtle">
            For Product Managers
          </p>
          <h1 className="text-3xl leading-snug text-ink sm:text-4xl lg:text-5xl italic">
            What would your colleagues say about you?
          </h1>
          <p className="mt-10 text-lg leading-loose text-subtle">
            Find out—anonymously. Get honest feedback from peers to identify blind spots and accelerate your growth.
          </p>
          <div className="mt-14">
            <Link href="/login" className="btn-primary">
              Start Your Feedback Cycle
            </Link>
          </div>
          <p className="mt-8 font-sans text-[10px] tracking-wider text-subtle">
            Takes 5 minutes to set up. Get results in days.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="flex justify-center">
        <div className="w-16 border-t border-border"></div>
      </div>

      {/* How it works */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl italic text-ink">How it works</h2>
          <p className="mt-4 text-center text-subtle">
            Three simple steps to honest feedback
          </p>
          <div className="mt-16 grid gap-16 sm:grid-cols-3">
            <div className="text-center">
              <span className="font-sans text-xs text-subtle">01</span>
              <h3 className="mt-4 text-xl italic text-ink">Rate yourself</h3>
              <p className="mt-4 leading-relaxed text-subtle">
                Assess your skills across 6 key PM competencies. This becomes your baseline.
              </p>
            </div>
            <div className="text-center">
              <span className="font-sans text-xs text-subtle">02</span>
              <h3 className="mt-4 text-xl italic text-ink">Invite peers</h3>
              <p className="mt-4 leading-relaxed text-subtle">
                Send to 5-8 colleagues who know your work. Anonymous or named—your choice.
              </p>
            </div>
            <div className="text-center">
              <span className="font-sans text-xs text-subtle">03</span>
              <h3 className="mt-4 text-xl italic text-ink">Discover gaps</h3>
              <p className="mt-4 leading-relaxed text-subtle">
                Compare how you see yourself vs. how others see you. Find your blind spots.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex justify-center">
        <div className="w-16 border-t border-border"></div>
      </div>

      {/* Skills section */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl italic text-ink">
            Get feedback on what matters
          </h2>
          <p className="mt-4 text-center text-subtle">
            Six core competencies that define PM excellence
          </p>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {[
              { name: 'Discovery & User Understanding', desc: 'How well you understand customers' },
              { name: 'Prioritization & Roadmap', desc: 'Quality of your trade-off decisions' },
              { name: 'Execution & Delivery', desc: 'Getting things shipped' },
              { name: 'Communication', desc: 'Clarity, frequency, right audience' },
              { name: 'Stakeholder Management', desc: 'Managing up, across, and down' },
              { name: 'Technical Fluency', desc: 'Working effectively with engineering' },
            ].map((skill) => (
              <div key={skill.name} className="border-b border-border pb-6">
                <h3 className="italic text-ink">{skill.name}</h3>
                <p className="mt-2 font-sans text-sm text-subtle">{skill.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex justify-center">
        <div className="w-16 border-t border-border"></div>
      </div>

      {/* Why anonymous */}
      <div className="px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl italic text-ink">
            Why anonymous feedback?
          </h2>
          <p className="mt-8 text-lg leading-loose text-subtle">
            People are more honest when there is no fear of consequences. Anonymous feedback reveals what colleagues really think—the good, the bad, and the growth opportunities.
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 text-left">
            <div>
              <h3 className="italic text-ink">Anonymous mode</h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-subtle">
                All feedback is pooled and shuffled. You will never know who said what—just the patterns.
              </p>
            </div>
            <div>
              <h3 className="italic text-ink">Named mode</h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-subtle">
                See who gave which feedback. Great for deeper follow-up conversations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-accent px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl italic text-paper">
            Ready to see yourself through others' eyes?
          </h2>
          <p className="mt-6 text-primary-300">
            The gap between self-perception and reality is where growth happens.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-block border border-paper px-8 py-4 font-sans text-[10px] uppercase tracking-[0.25em] text-paper transition-all duration-500 hover:bg-paper hover:text-accent"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-sans text-[10px] tracking-wider text-subtle">
            PeerLens — Peer feedback for Product Managers
          </p>
        </div>
      </footer>
    </main>
  )
}
