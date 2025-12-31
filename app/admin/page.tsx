import Link from 'next/link'
import { getTemplates } from '@/lib/actions/admin-templates'
import { TemplateCard } from './components/TemplateCard'

export default async function AdminPage() {
  const templates = await getTemplates()

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Templates</h1>
          <p className="mt-1 text-gray-600">
            Manage question templates and their answer options
          </p>
        </div>
        <Link
          href="/admin/templates/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No templates yet</p>
          <Link
            href="/admin/templates/new"
            className="text-primary-600 hover:underline mt-2 inline-block"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}
