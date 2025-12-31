'use client'

import { useState } from 'react'
import type { QuestionType } from '@/types/database'

interface QuestionFormProps {
  initialData?: {
    skill_key: string
    skill_name: string
    skill_description: string
    question_type: QuestionType
  }
  onSubmit: (data: {
    skill_key: string
    skill_name: string
    skill_description: string
    question_type: QuestionType
  }) => void
  onCancel: () => void
  isSubmitting: boolean
}

const QUESTION_TYPES: { value: QuestionType; label: string; description: string }[] = [
  { value: 'rating', label: 'Rating Scale', description: 'Comparative rating (e.g., Bottom 20% to Top 20%)' },
  { value: 'single_choice', label: 'Single Choice', description: 'Pick one option (radio buttons)' },
  { value: 'multi_choice', label: 'Multiple Choice', description: 'Pick multiple options (checkboxes)' },
  { value: 'text', label: 'Free Text', description: 'Open text response' },
  { value: 'scale', label: 'Numeric Scale', description: 'Numeric rating (e.g., 1-5, 1-10)' },
]

export function QuestionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: QuestionFormProps) {
  const [skillKey, setSkillKey] = useState(initialData?.skill_key || '')
  const [skillName, setSkillName] = useState(initialData?.skill_name || '')
  const [skillDescription, setSkillDescription] = useState(
    initialData?.skill_description || ''
  )
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialData?.question_type || 'rating'
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      skill_key: skillKey.trim().toLowerCase().replace(/\s+/g, '_'),
      skill_name: skillName.trim(),
      skill_description: skillDescription.trim(),
      question_type: questionType,
    })
  }

  // Auto-generate key from name
  function handleNameChange(value: string) {
    setSkillName(value)
    if (!initialData) {
      // Only auto-generate for new questions
      setSkillKey(value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="skillName" className="block text-sm font-medium text-gray-700 mb-1">
            Question Name *
          </label>
          <input
            id="skillName"
            type="text"
            value={skillName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Communication Skills"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        <div>
          <label htmlFor="skillKey" className="block text-sm font-medium text-gray-700 mb-1">
            Key *
          </label>
          <input
            id="skillKey"
            type="text"
            value={skillKey}
            onChange={(e) => setSkillKey(e.target.value)}
            placeholder="e.g., communication"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="skillDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <input
          id="skillDescription"
          type="text"
          value={skillDescription}
          onChange={(e) => setSkillDescription(e.target.value)}
          placeholder="e.g., How well they communicate with team members"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Question Type *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {QUESTION_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setQuestionType(type.value)}
              className={`p-3 text-left border rounded-lg transition-colors ${
                questionType === type.value
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-sm text-gray-900">{type.label}</div>
              <div className="text-xs text-gray-500">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !skillKey || !skillName || !skillDescription}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add Question'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
