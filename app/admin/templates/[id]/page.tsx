import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTemplateForAdmin } from '@/lib/actions/admin-templates'
import { TemplateHeader } from './TemplateHeader'
import { QuestionList } from './QuestionList'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTemplatePage({ params }: PageProps) {
  const { id } = await params
  const template = await getTemplateForAdmin(id)

  if (!template) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          &larr; Back to Templates
        </Link>
      </div>

      <TemplateHeader template={template} />

      <div className="mt-8">
        <QuestionList templateId={template.id} questions={template.questions} />
      </div>
    </div>
  )
}
