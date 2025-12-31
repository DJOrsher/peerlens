import Link from 'next/link'
import type { SkillTemplate } from '@/types/database'

interface TemplateCardProps {
  template: SkillTemplate
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Link
      href={`/admin/templates/${template.id}`}
      className="block bg-white rounded-lg border border-gray-200 p-6 hover:border-primary-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{template.name}</h3>
        <div className="flex gap-2">
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
      </div>
      {template.description && (
        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
      )}
      <div className="text-xs text-gray-400">
        Slug: {template.slug}
      </div>
    </Link>
  )
}
