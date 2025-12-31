'use client'

import { useState, useTransition, useCallback } from 'react'
import { submitSharedResponse } from '@/lib/actions/respond'
import { SKILL_RATING_OPTIONS } from '@/types/database'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { ConversionCTA } from '@/components/ConversionCTA'
import type { ClosenessLevel, RelationshipType, SkillRating, SkillTemplateQuestion } from '@/types/database'

interface CustomQuestion {
  id: string
  question_text: string
  question_order: number
}

interface Props {
  cycleId: string
  requesterName: string
  cycleMode: 'anonymous' | 'named'
  questions: SkillTemplateQuestion[]
  customQuestions: CustomQuestion[]
}

type Step = 'identity' | 'prescreen' | 'skills' | 'open_ended' | 'custom' | 'anonymous_note' | 'confirm'

const CLOSENESS_OPTIONS = [
  { value: 'very_close', label: 'Very closely', description: 'We work together daily or weekly' },
  { value: 'somewhat', label: 'Somewhat closely', description: 'We collaborate regularly on projects' },
  { value: 'not_much', label: 'Not very closely', description: 'We interact occasionally' },
  { value: 'barely', label: 'Barely', description: 'We rarely work together directly' },
  { value: 'not_sure', label: 'Not sure', description: 'I can\'t really say', separatorBefore: true },
] as const

const RELATIONSHIP_OPTIONS = [
  { value: 'team', label: 'Same team', description: 'We work on the same team' },
  { value: 'cross_functional', label: 'Cross-functional', description: 'Different team, work together on projects' },
  { value: 'manager', label: 'Manager', description: 'I manage this person or they manage me' },
  { value: 'peer_pm', label: 'Peer PM', description: 'Fellow product manager' },
  { value: 'other', label: 'Other', description: 'None of the above' },
  { value: 'not_sure', label: 'Not sure', description: 'I\'m not certain of the relationship', separatorBefore: true },
] as const

export function SharedRespondWizard({ cycleId, requesterName, cycleMode, questions, customQuestions }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Identity (optional for shared links)
  const [responderName, setResponderName] = useState('')
  const [responderEmail, setResponderEmail] = useState('')

  // Form state
  const [closeness, setCloseness] = useState<ClosenessLevel | ''>('')
  const [relationship, setRelationship] = useState<RelationshipType | ''>('')
  const [skillRatings, setSkillRatings] = useState<Record<string, SkillRating>>({})
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0)
  const [keepDoing, setKeepDoing] = useState('')
  const [improve, setImprove] = useState('')
  const [anythingElse, setAnythingElse] = useState('')
  const [customAnswers, setCustomAnswers] = useState<string[]>(customQuestions.map(() => ''))
  const [anonymousNote, setAnonymousNote] = useState('')

  // Step management
  const [step, setStep] = useState<Step>('identity')

  const hasCustomQuestions = customQuestions.length > 0
  const showAnonymousNote = cycleMode === 'named'

  function getSteps(): Step[] {
    const steps: Step[] = ['identity', 'prescreen', 'skills', 'open_ended']
    if (hasCustomQuestions) steps.push('custom')
    if (showAnonymousNote) steps.push('anonymous_note')
    steps.push('confirm')
    return steps
  }

  const steps = getSteps()
  const currentStepIndex = steps.indexOf(step)
  const totalSteps = steps.length
  const isLastStep = currentStepIndex === totalSteps - 1

  function canGoNext(): boolean {
    switch (step) {
      case 'identity':
        return true // Identity is optional
      case 'prescreen':
        return !!closeness && !!relationship
      case 'skills':
        return currentSkillIndex >= questions.length - 1 && questions.every(q => skillRatings[q.skill_key])
      case 'open_ended':
        return keepDoing.trim().length >= 10 && improve.trim().length >= 10
      case 'custom':
        return true // Custom questions are optional
      case 'anonymous_note':
        return true // Anonymous note is optional
      default:
        return true
    }
  }

  function goNext() {
    // Special handling for skills step (one at a time)
    if (step === 'skills' && currentSkillIndex < questions.length - 1) {
      if (skillRatings[questions[currentSkillIndex].skill_key]) {
        setCurrentSkillIndex(prev => prev + 1)
      }
      return
    }

    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex])
    }
  }

  function goBack() {
    // Special handling for skills step
    if (step === 'skills' && currentSkillIndex > 0) {
      setCurrentSkillIndex(prev => prev - 1)
      return
    }

    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex])
      if (steps[prevIndex] === 'skills') {
        setCurrentSkillIndex(questions.length - 1)
      }
    }
  }

  // Auto-advance for skill ratings
  const advanceSkill = useCallback(() => {
    if (currentSkillIndex < questions.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSkillIndex(prev => prev + 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      // Move to next step after last skill
      setIsTransitioning(true)
      setTimeout(() => {
        const nextIndex = currentStepIndex + 1
        if (nextIndex < steps.length) {
          setStep(steps[nextIndex])
        }
        setIsTransitioning(false)
      }, 300)
    }
  }, [currentSkillIndex, questions.length, currentStepIndex, steps])

  function handleSkillRatingSelect(value: SkillRating) {
    if (isTransitioning) return
    const currentQuestion = questions[currentSkillIndex]
    if (!currentQuestion) return

    setSkillRatings(prev => ({
      ...prev,
      [currentQuestion.skill_key]: value
    }))
    // Auto-advance after selection
    setTimeout(advanceSkill, 400)
  }

  async function handleSubmit() {
    setError(null)

    startTransition(async () => {
      const result = await submitSharedResponse(cycleId, {
        closeness: closeness as ClosenessLevel,
        relationship: relationship as RelationshipType,
        skill_ratings: skillRatings,
        keep_doing: keepDoing,
        improve: improve,
        anything_else: anythingElse || undefined,
        custom_answers: customAnswers.filter(a => a.trim()),
        anonymous_note: anonymousNote || undefined,
        responder_name: responderName || undefined,
        responder_email: responderEmail || undefined,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setIsSubmitted(true)
    })
  }

  // Submitted confirmation
  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-xl border bg-white p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Thank you!</h1>
          <p className="mt-3 text-gray-600">
            Your feedback has been submitted{cycleMode === 'anonymous' ? ' anonymously' : ''} to {requesterName}.
          </p>

          <ConversionCTA responderEmail={responderEmail || null} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>Feedback for {requesterName}</span>
          <span>Step {currentStepIndex + 1} of {totalSteps}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step content */}
      <div className={`rounded-xl border bg-white p-8 shadow-sm transition-all duration-300 ${
        isTransitioning ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      }`}>
        {step === 'identity' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Who are you?
            </h2>
            <p className="text-gray-600 mb-6">
              {cycleMode === 'named'
                ? `Your name will be shown to ${requesterName} along with your feedback.`
                : 'This is optional. Your feedback will be anonymous regardless.'}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your name {cycleMode === 'anonymous' && '(optional)'}
                </label>
                <input
                  type="text"
                  value={responderName}
                  onChange={(e) => setResponderName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your email {cycleMode === 'anonymous' && '(optional)'}
                </label>
                <input
                  type="email"
                  value={responderEmail}
                  onChange={(e) => setResponderEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {cycleMode === 'anonymous' && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                  Even if you provide your details, your feedback will be shown anonymously to {requesterName}.
                </p>
              )}
            </div>
          </>
        )}

        {step === 'prescreen' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Before we start
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How closely have you worked with {requesterName}?
                </label>
                <RadioGroup
                  options={CLOSENESS_OPTIONS}
                  value={closeness}
                  onChange={setCloseness}
                  name="closeness"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What&apos;s your working relationship?
                </label>
                <RadioGroup
                  options={RELATIONSHIP_OPTIONS}
                  value={relationship}
                  onChange={setRelationship}
                  name="relationship"
                />
              </div>
            </div>
          </>
        )}

        {step === 'skills' && questions[currentSkillIndex] && (
          <>
            <div className="mb-2 text-sm text-gray-500">
              Skill {currentSkillIndex + 1} of {questions.length}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {questions[currentSkillIndex].skill_name}
            </h2>
            <p className="mt-2 text-gray-600 mb-6">
              {questions[currentSkillIndex].skill_description}
            </p>

            <p className="text-sm font-medium text-gray-700 mb-3">
              Compared to other professionals you&apos;ve worked with, how would you rate {requesterName}?
            </p>

            <RadioGroup
              options={SKILL_RATING_OPTIONS}
              value={skillRatings[questions[currentSkillIndex].skill_key] || ''}
              onChange={handleSkillRatingSelect}
              name="skill-rating"
            />
          </>
        )}

        {step === 'open_ended' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Open feedback
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What should {requesterName} keep doing? *
                </label>
                <textarea
                  value={keepDoing}
                  onChange={(e) => setKeepDoing(e.target.value)}
                  placeholder="What are they doing well that they should continue..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {keepDoing.length}/10 characters minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What should {requesterName} improve? *
                </label>
                <textarea
                  value={improve}
                  onChange={(e) => setImprove(e.target.value)}
                  placeholder="What could they do better or differently..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {improve.length}/10 characters minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anything else? (optional)
                </label>
                <textarea
                  value={anythingElse}
                  onChange={(e) => setAnythingElse(e.target.value)}
                  placeholder="Any other thoughts or feedback..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
              </div>
            </div>
          </>
        )}

        {step === 'custom' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Additional questions
            </h2>
            <p className="text-gray-600 mb-6">
              {requesterName} asked these specific questions:
            </p>

            <div className="space-y-6">
              {customQuestions.map((q, i) => (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {q.question_text}
                  </label>
                  <textarea
                    value={customAnswers[i] || ''}
                    onChange={(e) => {
                      const newAnswers = [...customAnswers]
                      newAnswers[i] = e.target.value
                      setCustomAnswers(newAnswers)
                    }}
                    placeholder="Your answer..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'anonymous_note' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Anonymous note (optional)
            </h2>
            <p className="text-gray-600 mb-6">
              Since this is a named feedback cycle, {requesterName} will see your name with your responses.
              If there&apos;s something you&apos;d like to share anonymously, add it here.
            </p>

            <textarea
              value={anonymousNote}
              onChange={(e) => setAnonymousNote(e.target.value)}
              placeholder="This will be shown without your name attached..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
            />
          </>
        )}

        {step === 'confirm' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to submit?
            </h2>
            <p className="text-gray-600 mb-6">
              Your feedback will be shared {cycleMode === 'anonymous' ? 'anonymously' : (responderName ? `as ${responderName}` : 'anonymously')} with {requesterName}.
            </p>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {responderName && cycleMode === 'named' && <li>• Responding as: {responderName}</li>}
                <li>• {questions.length} skills rated</li>
                <li>• Open feedback provided</li>
                {customQuestions.length > 0 && <li>• {customQuestions.length} custom questions answered</li>}
                {anonymousNote && <li>• Anonymous note included</li>}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={currentStepIndex === 0 && (step !== 'skills' || currentSkillIndex === 0)}
          className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${
            currentStepIndex > 0 || (step === 'skills' && currentSkillIndex > 0)
              ? 'text-gray-700 hover:bg-gray-100'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {step === 'confirm' ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Submit feedback'}
          </button>
        ) : step === 'skills' ? (
          /* No Next button for skills - auto-advances on selection */
          <div className="w-32" />
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext()}
            className={`flex items-center gap-2 rounded-lg px-8 py-3 font-semibold transition-colors ${
              canGoNext()
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
    </div>
  )
}
