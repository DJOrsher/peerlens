'use client'

import { useState } from 'react'
import { signInWithMagicLink } from '@/lib/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    const formData = new FormData()
    formData.append('email', email)

    const result = await signInWithMagicLink(formData)

    if (result.error) {
      setStatus('error')
      setErrorMessage(result.error)
    } else {
      setStatus('success')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            PeerLens
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Sign in</h1>
          <p className="mt-2 text-gray-600">
            Enter your email to receive a magic link
          </p>
        </div>

        {status === 'success' ? (
          <div className="rounded-lg bg-green-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-green-800">Check your email</h2>
            <p className="mt-2 text-green-700">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="mt-4 text-sm text-green-600">
              Click the link in the email to sign in. The link expires in 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {status === 'error' && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'loading' ? 'Sending...' : 'Send magic link'}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link href="/" className="text-primary-600 hover:text-primary-500">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
