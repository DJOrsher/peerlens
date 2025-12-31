'use client'

import { useState } from 'react'
import { signInWithMagicLink, signInWithGoogle } from '@/lib/actions/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setErrorMessage('')

    const result = await signInWithGoogle()

    if (result?.error) {
      setErrorMessage(result.error)
      setGoogleLoading(false)
    }
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              PeerLens
            </Link>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-2 text-gray-600">
              Sign in to manage your feedback cycles
            </p>
          </div>

          {status === 'success' ? (
            <div className="rounded-lg bg-green-50 p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-green-800">Check your email</h2>
              <p className="mt-2 text-green-700">
                We sent a sign-in link to <strong>{email}</strong>
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 text-sm text-green-600 hover:text-green-700"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {googleLoading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">or</span>
                </div>
              </div>

              {/* Magic Link Form */}
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
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

                {errorMessage && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending...' : 'Send sign-in link'}
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/" className="text-primary-600 hover:text-primary-500">
            &larr; Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
