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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!isOpen) return null

  async function handlePurchase() {
    setIsProcessing(true)
    setMessage(null)

    const result = await addFreeCredits()

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Credits added!' })
      if (onCreditsAdded && result.credits !== undefined) {
        onCreditsAdded(result.credits)
      }
      // Auto-close after success
      setTimeout(() => {
        onClose()
      }, 3000)
    } else {
      setMessage({ type: 'error', text: result.message || 'Failed to add credits' })
    }

    setIsProcessing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
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

          {message && (
            <div className={`mt-4 rounded-lg p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {!message?.type || message.type === 'error' ? (
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
          ) : null}

          <div className="mt-6 flex gap-3">
            {!message?.type || message.type === 'error' ? (
              <>
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
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700"
              >
                Got it!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
