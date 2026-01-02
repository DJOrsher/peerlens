'use client'

import { useState } from 'react'
import { addFreeCredits } from '@/lib/actions/credits'
import { CREDIT_PACKAGE_AMOUNT, CREDIT_PACKAGE_PRICE, CYCLE_COST } from '@/lib/credits-constants'

interface CreditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  currentCredits: number
  onCreditsAdded?: (newCredits: number) => void
}

export function CreditPurchaseModal({
  isOpen,
  onClose,
  currentCredits,
  onCreditsAdded,
}: CreditPurchaseModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [creditsAdded, setCreditsAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handlePurchase() {
    setIsProcessing(true)
    setError(null)

    const result = await addFreeCredits()

    if (result.success) {
      setCreditsAdded(true)
      if (onCreditsAdded && result.credits !== undefined) {
        onCreditsAdded(result.credits)
      }
    } else {
      setError(result.message || 'Failed to add credits')
    }

    setIsProcessing(false)
  }

  // Success state - gift celebration
  if (creditsAdded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-8 shadow-2xl mx-4">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200">
              <svg className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-900">
              You got {CREDIT_PACKAGE_AMOUNT} free credits!
            </h2>

            <p className="mt-3 text-gray-600">
              We&apos;re still building our payment system, so this one&apos;s on us. Enjoy your feedback cycle!
            </p>

            <div className="mt-6 rounded-lg bg-primary-50 border border-primary-100 p-4">
              <div className="text-sm text-primary-700">
                Your new balance: <span className="font-bold">{currentCredits + CREDIT_PACKAGE_AMOUNT} credits</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-white hover:bg-primary-700"
            >
              Start my feedback cycle
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Default state - purchase prompt
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-8 w-8 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.17-.364.264-.521z" />
            </svg>
          </div>

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Not enough credits
          </h2>

          <p className="mt-2 text-gray-600">
            You have <span className="font-semibold">{currentCredits} credits</span>, but running a feedback cycle costs <span className="font-semibold">{CYCLE_COST} credits</span>.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  {CREDIT_PACKAGE_AMOUNT} Credits
                </div>
                <div className="text-sm text-gray-500">
                  Run one complete feedback cycle
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${CREDIT_PACKAGE_PRICE}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Buy credits'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
