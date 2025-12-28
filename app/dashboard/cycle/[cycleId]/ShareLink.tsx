'use client'

import { useState } from 'react'

interface Props {
  sharedToken: string
}

export function ShareLink({ sharedToken }: Props) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/respond/c/${sharedToken}`
    : `/respond/c/${sharedToken}`

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="mt-6 rounded-lg border bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Share Link</h2>
          <p className="mt-1 text-sm text-gray-500">
            Share this link with anyone you want feedback from
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl}
          className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-600"
        />
        <button
          onClick={copyToClipboard}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Anyone with this link can submit feedback. They can optionally provide their name.
      </p>
    </div>
  )
}
