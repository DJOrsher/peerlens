'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from '@/lib/actions/admin-templates'
import type { SkillTemplateQuestionWithOptions, QuestionType } from '@/types/database'
import { QuestionForm } from './QuestionForm'
import { QuestionOptionsEditor } from './QuestionOptionsEditor'

interface QuestionListProps {
  templateId: string
  questions: SkillTemplateQuestionWithOptions[]
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  rating: 'Rating Scale',
  single_choice: 'Single Choice',
  multi_choice: 'Multiple Choice',
  text: 'Text',
  scale: 'Numeric Scale',
}

export function QuestionList({ templateId, questions }: QuestionListProps) {
  const router = useRouter()
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [editingOptionsId, setEditingOptionsId] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const [orderedIds, setOrderedIds] = useState(questions.map((q) => q.id))
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAddQuestion(data: {
    skill_key: string
    skill_name: string
    skill_description: string
    question_type: QuestionType
  }) {
    setIsSubmitting(true)
    const result = await createQuestion(templateId, data)

    if ('error' in result) {
      alert(result.error)
      setIsSubmitting(false)
      return
    }

    setIsAddingQuestion(false)
    setIsSubmitting(false)
    router.refresh()
  }

  async function handleUpdateQuestion(
    id: string,
    data: {
      skill_key: string
      skill_name: string
      skill_description: string
      question_type: QuestionType
    }
  ) {
    setIsSubmitting(true)
    const result = await updateQuestion(id, data)

    if ('error' in result) {
      alert(result.error)
      setIsSubmitting(false)
      return
    }

    setEditingQuestionId(null)
    setIsSubmitting(false)
    router.refresh()
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm('Are you sure you want to delete this question?')) return

    setIsSubmitting(true)
    const result = await deleteQuestion(id)

    if ('error' in result) {
      alert(result.error)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    router.refresh()
  }

  function moveQuestion(index: number, direction: 'up' | 'down') {
    const newIds = [...orderedIds]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= newIds.length) return

    ;[newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]]
    setOrderedIds(newIds)
  }

  async function handleSaveOrder() {
    setIsSubmitting(true)
    const result = await reorderQuestions(templateId, orderedIds)

    if ('error' in result) {
      alert(result.error)
      setIsSubmitting(false)
      return
    }

    setIsReordering(false)
    setIsSubmitting(false)
    router.refresh()
  }

  // Sort questions by the current order
  const sortedQuestions = isReordering
    ? orderedIds.map((id) => questions.find((q) => q.id === id)!).filter(Boolean)
    : questions

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Questions ({questions.length})
        </h2>
        <div className="flex gap-2">
          {isReordering ? (
            <>
              <button
                onClick={handleSaveOrder}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Order'}
              </button>
              <button
                onClick={() => {
                  setIsReordering(false)
                  setOrderedIds(questions.map((q) => q.id))
                }}
                className="px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {questions.length > 1 && (
                <button
                  onClick={() => setIsReordering(true)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reorder
                </button>
              )}
              <button
                onClick={() => setIsAddingQuestion(true)}
                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Question
              </button>
            </>
          )}
        </div>
      </div>

      {isAddingQuestion && (
        <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-4">New Question</h3>
          <QuestionForm
            onSubmit={handleAddQuestion}
            onCancel={() => setIsAddingQuestion(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {sortedQuestions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No questions yet</p>
          <button
            onClick={() => setIsAddingQuestion(true)}
            className="text-primary-600 hover:underline mt-2"
          >
            Add your first question
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedQuestions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              {editingQuestionId === question.id ? (
                <QuestionForm
                  initialData={{
                    skill_key: question.skill_key,
                    skill_name: question.skill_name,
                    skill_description: question.skill_description,
                    question_type: question.question_type,
                  }}
                  onSubmit={(data) => handleUpdateQuestion(question.id, data)}
                  onCancel={() => setEditingQuestionId(null)}
                  isSubmitting={isSubmitting}
                />
              ) : editingOptionsId === question.id ? (
                <QuestionOptionsEditor
                  questionId={question.id}
                  questionType={question.question_type}
                  options={question.options}
                  onClose={() => {
                    setEditingOptionsId(null)
                    router.refresh()
                  }}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="font-medium text-gray-900">
                        {question.skill_name}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {QUESTION_TYPE_LABELS[question.question_type]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {question.skill_description}
                    </p>
                    <p className="text-xs text-gray-400 ml-6 mt-1">
                      Key: {question.skill_key} | Options: {question.options.length}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isReordering ? (
                      <>
                        <button
                          onClick={() => moveQuestion(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveQuestion(index, 'down')}
                          disabled={index === sortedQuestions.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingOptionsId(question.id)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Options
                        </button>
                        <button
                          onClick={() => setEditingQuestionId(question.id)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={isSubmitting}
                          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
