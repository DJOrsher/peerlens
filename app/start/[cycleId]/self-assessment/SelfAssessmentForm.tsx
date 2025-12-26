'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveSelfAssessment, saveCustomQuestions } from '@/lib/actions/cycles'
import { PM_SKILLS, SKILL_RATING_OPTIONS } from '@/types/database'
import type { SkillRating } from '@/types/database'

interface Props {
  cycleId: string
  existingRatings?: Record<string, string>
}

export function SelfAssessmentForm({ cycleId, existingRatings }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [ratings, setRatings] = useState<Record<string, SkillRating>>(() => {
    const initial: Record<string, SkillRating> = {}
    PM_SKILLS.forEach(skill => {
      initial[skill.id] = (existingRatings?.[skill.id] as SkillRating) || ''
    })
    return initial
  })

  const [customQuestions, setCustomQuestions] = useState<string[]>(['', ''])
  const [showCustomQuestions, setShowCustomQuestions] = useState(false)

  const allRated = PM_SKILLS.every(skill => ratings[skill.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!allRated) {
      setError('Please rate yourself on all skills')
      return
    }

    startTransition(async () => {
      // Save self-assessment
      const result = await saveSelfAssessment(cycleId, ratings)
      if (result.error) {
        setError(result.error)
        return
      }

      // Save custom questions if any
      const filledQuestions = customQuestions.filter(q => q.trim())
      if (filledQuestions.length > 0) {
        const qResult = await saveCustomQuestions(cycleId, filledQuestions)
        if (qResult.error) {
          setError(qResult.error)
          return
        }
      }

      // Navigate to invite step
      router.push(`/start/${cycleId}/invite`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Skills */}
      <div className="space-y-6">
        {PM_SKILLS.map((skill) => (
          <div key={skill.id} className="rounded-lg border bg-white p-6">
            <h3 className="font-semibold text-gray-900">{skill.name}</h3>
            <p className="mt-1 text-sm text-gray-500">{skill.description}</p>

            <div className="mt-4 space-y-2">
              {SKILL_RATING_OPTIONS.filter(opt => opt.value !== 'cant_say').map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    ratings[skill.id] === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={skill.id}
                    value={option.value}
                    checked={ratings[skill.id] === option.value}
                    onChange={(e) => setRatings(prev => ({
                      ...prev,
                      [skill.id]: e.target.value as SkillRating
                    }))}
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className="ml-2 text-sm text-gray-500">— {option.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Questions */}
      <div className="rounded-lg border bg-white p-6">
        <button
          type="button"
          onClick={() => setShowCustomQuestions(!showCustomQuestions)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <h3 className="font-semibold text-gray-900">Custom questions (optional)</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add up to 2 questions you&apos;ve been wondering about
            </p>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${showCustomQuestions ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showCustomQuestions && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-600">
              Examples: &quot;Do I give people enough context?&quot; &quot;Am I too slow to make decisions?&quot;
            </p>
            {customQuestions.map((q, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-700">
                  Question {i + 1}
                </label>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => {
                    const newQuestions = [...customQuestions]
                    newQuestions[i] = e.target.value
                    setCustomQuestions(newQuestions)
                  }}
                  placeholder="Enter your question..."
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  maxLength={200}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-gray-500">
          {PM_SKILLS.filter(s => ratings[s.id]).length} of {PM_SKILLS.length} skills rated
        </p>
        <button
          type="submit"
          disabled={!allRated || isPending}
          className="rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Next: Invite peers'}
        </button>
      </div>
    </form>
  )
}
