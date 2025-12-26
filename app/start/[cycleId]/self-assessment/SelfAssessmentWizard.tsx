'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveSelfAssessment, saveCustomQuestions } from '@/lib/actions/cycles'
import { SKILL_RATING_OPTIONS } from '@/types/database'
import type { SkillRating, SkillTemplateQuestion } from '@/types/database'

interface Props {
  cycleId: string
  questions: SkillTemplateQuestion[]
  existingRatings?: Record<string, string>
}

export function SelfAssessmentWizard({ cycleId, questions, existingRatings }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  const [ratings, setRatings] = useState<Record<string, SkillRating>>(() => {
    const initial: Record<string, SkillRating> = {}
    questions.forEach(q => {
      initial[q.skill_key] = (existingRatings?.[q.skill_key] as SkillRating) || ''
    })
    return initial
  })

  const [customQuestions, setCustomQuestions] = useState<string[]>(['', ''])

  const totalSteps = questions.length + 1 // +1 for custom questions
  const isOnCustomStep = currentStep === questions.length
  const currentQuestion = questions[currentStep]
  const currentRating = currentQuestion ? ratings[currentQuestion.skill_key] : null

  const canGoNext = isOnCustomStep || currentRating
  const canGoBack = currentStep > 0
  const isLastStep = currentStep === totalSteps - 1

  function handleRatingSelect(value: SkillRating) {
    if (!currentQuestion) return
    setRatings(prev => ({
      ...prev,
      [currentQuestion.skill_key]: value
    }))
  }

  function goNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  async function handleSubmit() {
    setError(null)

    // Check all questions are answered
    const unanswered = questions.filter(q => !ratings[q.skill_key])
    if (unanswered.length > 0) {
      setError(`Please rate yourself on all skills. Missing: ${unanswered.map(q => q.skill_name).join(', ')}`)
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
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Self-assessment</span>
          <span>{currentStep + 1} of {totalSteps}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Question card */}
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        {!isOnCustomStep && currentQuestion ? (
          <>
            <div className="mb-6">
              <p className="text-sm font-medium text-primary-600 mb-2">
                Rate yourself honestly
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQuestion.skill_name}
              </h2>
              <p className="mt-2 text-gray-600">
                {currentQuestion.skill_description}
              </p>
            </div>

            <div className="space-y-3">
              {SKILL_RATING_OPTIONS.filter(opt => opt.value !== 'cant_say').map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRatingSelect(option.value as SkillRating)}
                  className={`w-full flex items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                    currentRating === option.value
                      ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    currentRating === option.value
                      ? 'border-primary-600 bg-primary-600'
                      : 'border-gray-300'
                  }`}>
                    {currentRating === option.value && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className="ml-2 text-gray-500">— {option.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm font-medium text-primary-600 mb-2">
                Optional
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                Custom questions
              </h2>
              <p className="mt-2 text-gray-600">
                Add up to 2 questions you&apos;ve been wondering about. Your peers will see these.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Examples: &quot;Do I give people enough context?&quot; &quot;Am I too slow to make decisions?&quot;
              </p>
              {customQuestions.map((q, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    maxLength={200}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${
            canGoBack
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Next: Invite peers'}
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className={`flex items-center gap-2 rounded-lg px-8 py-3 font-semibold transition-colors ${
              canGoNext
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Step indicators */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              // Only allow going back to completed steps or current
              if (i <= currentStep || (i <= currentStep + 1 && canGoNext)) {
                setCurrentStep(i)
              }
            }}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentStep
                ? 'w-6 bg-primary-600'
                : i < currentStep
                ? 'bg-primary-400'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
