'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateTemplate,
  deleteTemplate,
  setDefaultTemplate,
} from '@/lib/actions/admin-templates'
import type { SkillTemplate } from '@/types/database'

interface TemplateHeaderProps {
  template: SkillTemplate
}

export function TemplateHeader({ template }: TemplateHeaderProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(template.name)
  const [description, setDescription] = useState(template.description || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setIsSubmitting(true)
    setError('')

    const result = await updateTemplate(template.id, {
      name: name.trim(),
      description: description.trim() || undefined,
    })

    if ('error' in result) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    setIsEditing(false)
    setIsSubmitting(false)
    router.refresh()
  }

  async function handleToggleActive() {
    setIsSubmitting(true)
    await updateTemplate(template.id, { is_active: !template.is_active })
    setIsSubmitting(false)
    router.refresh()
  }

  async function handleSetDefault() {
    setIsSubmitting(true)
    await setDefaultTemplate(template.id)
    setIsSubmitting(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this template? This cannot be undone.')) {
      return
    }

    setIsSubmitting(true)
    const result = await deleteTemplate(template.id)

    if ('error' in result) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    router.push('/admin')
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSubmitting || !name.trim()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
              setName(template.name)
              setDescription(template.description || '')
              setError('')
            }}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
            {template.is_default && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded">
                Default
              </span>
            )}
            {!template.is_active && (
              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                Inactive
              </span>
            )}
          </div>
          {template.description && (
            <p className="text-gray-600 mb-2">{template.description}</p>
          )}
          <p className="text-sm text-gray-400">Slug: {template.slug}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleToggleActive}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {template.is_active ? 'Deactivate' : 'Activate'}
          </button>
          {!template.is_default && (
            <button
              onClick={handleSetDefault}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Set as Default
            </button>
          )}
          {!template.is_default && (
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
