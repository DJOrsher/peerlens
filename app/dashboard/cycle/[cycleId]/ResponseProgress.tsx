'use client'

import { useEffect, useState } from 'react'
import { getResponseCount } from '@/lib/actions/cycles'

interface Props {
  cycleId: string
  initialCount: number
  totalInvitations: number
  isActive: boolean
}

export function ResponseProgress({ cycleId, initialCount, totalInvitations, isActive }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    if (!isActive) return

    const poll = async () => {
      const newCount = await getResponseCount(cycleId)
      if (newCount !== null) {
        setCount(newCount)
      }
    }

    // Poll every 30 seconds
    const interval = setInterval(poll, 30000)

    return () => clearInterval(interval)
  }, [cycleId, isActive])

  return (
    <div className="mt-8 rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Responses</h2>
        <span className="text-2xl font-bold text-primary-600">
          {count} of {totalInvitations}
        </span>
      </div>
      {totalInvitations > 0 && (
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${(count / totalInvitations) * 100}%` }}
            />
          </div>
        </div>
      )}
      {isActive && (
        <p className="mt-2 text-xs text-gray-400">Auto-updates every 30 seconds</p>
      )}
    </div>
  )
}
