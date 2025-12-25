import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-3xl text-center">
        <h1 className="text-6xl font-bold mb-6">
          What would your colleagues say about you?
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find out—anonymously. Get honest feedback from peers to identify blind spots and accelerate your growth.
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </main>
  )
}