'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CreditPurchaseModal } from '@/components/CreditPurchaseModal'

interface Props {
  currentCredits: number
  children: React.ReactNode
}

export function StartPageClient({ currentCredits, children }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [credits, setCredits] = useState(currentCredits)

  useEffect(() => {
    if (searchParams.get('error') === 'no_credits') {
      setShowCreditModal(true)
      // Clear the error from URL
      router.replace('/start', { scroll: false })
    }
  }, [searchParams, router])

  function handleCreditsAdded(newCredits: number) {
    setCredits(newCredits)
  }

  return (
    <>
      {children}
      <CreditPurchaseModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        currentCredits={credits}
        onCreditsAdded={handleCreditsAdded}
      />
    </>
  )
}
