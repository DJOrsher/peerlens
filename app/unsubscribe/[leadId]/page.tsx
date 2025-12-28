import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Props {
  params: Promise<{ leadId: string }>
}

export default async function UnsubscribePage({ params }: Props) {
  const { leadId } = await params
  const supabase = createServiceClient()

  // Mark lead as unsubscribed
  const { error } = await supabase
    .from('nurture_leads')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('id', leadId)

  if (error) {
    console.error('Unsubscribe error:', error)
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 py-12 text-center">
        <div className="rounded-lg bg-white border p-8 shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            You've been unsubscribed
          </h1>

          <p className="text-gray-600 mb-6">
            You won't receive any more reminder emails from us. If you change your mind, you can always start a feedback cycle directly.
          </p>

          <Link
            href="/"
            className="inline-block rounded-lg bg-primary-600 px-6 py-2 font-medium text-white hover:bg-primary-700"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
