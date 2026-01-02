'use client'

import { useState } from 'react'
import { CreditPurchaseModal } from '@/components/CreditPurchaseModal'

interface Props {
  currentCredits: number
  showCreditModalInitially: boolean
  children: React.ReactNode
}

export function StartPageClient({ currentCredits, showCreditModalInitially, children }: Props) {
  const [showCreditModal, setShowCreditModal] = useState(showCreditModalInitially)
  const [credits, setCredits] = useState(currentCredits)

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
