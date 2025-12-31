'use client'

import { useState } from 'react'
import {
  saveQuestionOptions,
  copyPresetToQuestion,
} from '@/lib/actions/admin-templates'
import { PRESET_SCALES } from '@/lib/preset-scales'
import type { QuestionOption, QuestionType } from '@/types/database'

interface QuestionOptionsEditorProps {
  questionId: string
  questionType: QuestionType
  options: QuestionOption[]
  onClose: () => void
}

interface EditableOption {
  id?: string
  value: string
  label: string
  description: string
  is_separator: boolean
}

export function QuestionOptionsEditor({
  questionId,
  questionType,
  options: initialOptions,
  onClose,
}: QuestionOptionsEditorProps) {
  const [options, setOptions] = useState<EditableOption[]>(
    initialOptions.map((o) => ({
      id: o.id,
      value: o.value,
      label: o.label,
      description: o.description || '',
      is_separator: o.is_separator,
    }))
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Text type doesn't need options
  if (questionType === 'text') {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-sm">
          Text questions don&apos;t require answer options.
        </p>
        <button
          onClick={onClose}
          className="mt-3 px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Close
        </button>
      </div>
    )
  }

  async function handleCopyPreset(presetId: string) {
    setIsSubmitting(true)
    setError('')

    const result = await copyPresetToQuestion(questionId, presetId)

    if ('error' in result) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    // Update local state with preset options
    const preset = PRESET_SCALES.find((p) => p.id === presetId)
    if (preset) {
      setOptions(
        preset.options.map((o) => ({
          value: o.value,
          label: o.label,
          description: o.description,
          is_separator: o.is_separator,
        }))
      )
    }

    setIsSubmitting(false)
  }

  async function handleSave() {
    setIsSubmitting(true)
    setError('')

    // Validate - all options need value and label
    const invalidOptions = options.filter((o) => !o.value.trim() || !o.label.trim())
    if (invalidOptions.length > 0) {
      setError('All options must have a value and label')
      setIsSubmitting(false)
      return
    }

    // Check for duplicate values
    const values = options.map((o) => o.value.trim().toLowerCase())
    const duplicates = values.filter((v, i) => values.indexOf(v) !== i)
    if (duplicates.length > 0) {
      setError(`Duplicate values: ${duplicates.join(', ')}`)
      setIsSubmitting(false)
      return
    }

    const result = await saveQuestionOptions(
      questionId,
      options.map((o) => ({
        value: o.value.trim(),
        label: o.label.trim(),
        description: o.description.trim() || undefined,
        is_separator: o.is_separator,
      }))
    )

    if ('error' in result) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    onClose()
  }

  function addOption() {
    setOptions([
      ...options,
      { value: '', label: '', description: '', is_separator: false },
    ])
  }

  function removeOption(index: number) {
    setOptions(options.filter((_, i) => i !== index))
  }

  function updateOption(index: number, field: keyof EditableOption, value: string | boolean) {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  function moveOption(index: number, direction: 'up' | 'down') {
    const newOptions = [...options]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newOptions.length) return

    ;[newOptions[index], newOptions[targetIndex]] = [
      newOptions[targetIndex],
      newOptions[index],
    ]
    setOptions(newOptions)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Answer Options</h3>
        <div className="flex gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) handleCopyPreset(e.target.value)
              e.target.value = ''
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
            disabled={isSubmitting}
          >
            <option value="">Copy from preset...</option>
            {PRESET_SCALES.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2 mb-4">
        {options.map((option, index) => (
          <div
            key={option.id || `new-${index}`}
            className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => moveOption(index, 'up')}
                disabled={index === 0}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveOption(index, 'down')}
                disabled={index === options.length - 1}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↓
              </button>
            </div>

            <div className="flex-1 grid grid-cols-3 gap-2">
              <input
                type="text"
                value={option.value}
                onChange={(e) => updateOption(index, 'value', e.target.value)}
                placeholder="Value (e.g., agree)"
                className="px-2 py-1.5 text-sm border border-gray-300 rounded font-mono"
              />
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateOption(index, 'label', e.target.value)}
                placeholder="Label (e.g., Agree)"
                className="px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
              <input
                type="text"
                value={option.description}
                onChange={(e) => updateOption(index, 'description', e.target.value)}
                placeholder="Description (optional)"
                className="px-2 py-1.5 text-sm border border-gray-300 rounded"
              />
            </div>

            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={option.is_separator}
                onChange={(e) => updateOption(index, 'is_separator', e.target.checked)}
                className="rounded"
              />
              Separator
            </label>

            <button
              type="button"
              onClick={() => removeOption(index)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addOption}
        className="mb-4 px-3 py-1.5 text-sm text-primary-600 border border-primary-300 rounded-lg hover:bg-primary-50"
      >
        + Add Option
      </button>

      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSubmitting || options.length === 0}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Options'}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
