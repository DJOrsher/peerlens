import type { AnonymousReport } from '@/lib/actions/report'
import { SkillComparison } from './SkillComparison'

interface Props {
  report: AnonymousReport
}

export function AnonymousReportView({ report }: Props) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Summary</h2>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-2xl font-bold text-gray-900">{report.responses_count}</p>
            <p className="text-sm text-gray-500">Responses</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-2xl font-bold text-gray-900">{report.invitations_count}</p>
            <p className="text-sm text-gray-500">Invited</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-2xl font-bold text-gray-900">
              {report.invitations_count > 0
                ? Math.round((report.responses_count / report.invitations_count) * 100)
                : 0}%
            </p>
            <p className="text-sm text-gray-500">Response Rate</p>
          </div>
        </div>
      </div>

      {/* Skill comparison */}
      <SkillComparison
        selfRatings={report.self_ratings}
        peerRatings={report.peer_ratings}
        gaps={report.gaps}
      />

      {/* Open-ended feedback */}
      <div className="rounded-lg border bg-white">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Open-Ended Feedback</h2>
          <p className="text-sm text-gray-500">Anonymous responses from your peers</p>
        </div>

        <div className="divide-y">
          {/* Keep doing */}
          <div className="px-6 py-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm">+</span>
              What you should keep doing
            </h3>
            {report.open_ended.keep_doing.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {report.open_ended.keep_doing.map((text, i) => (
                  <li key={i} className="rounded-lg bg-green-50 p-3 text-gray-700">
                    &ldquo;{text}&rdquo;
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-gray-500 italic">No responses</p>
            )}
          </div>

          {/* Improve */}
          <div className="px-6 py-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-sm">→</span>
              What you could improve
            </h3>
            {report.open_ended.improve.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {report.open_ended.improve.map((text, i) => (
                  <li key={i} className="rounded-lg bg-amber-50 p-3 text-gray-700">
                    &ldquo;{text}&rdquo;
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-gray-500 italic">No responses</p>
            )}
          </div>

          {/* Anything else */}
          {report.open_ended.anything_else.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="font-medium text-gray-900 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">💬</span>
                Additional comments
              </h3>
              <ul className="mt-3 space-y-3">
                {report.open_ended.anything_else.map((text, i) => (
                  <li key={i} className="rounded-lg bg-blue-50 p-3 text-gray-700">
                    &ldquo;{text}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Custom questions */}
      {report.custom_questions.length > 0 && (
        <div className="rounded-lg border bg-white">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Custom Questions</h2>
          </div>

          <div className="divide-y">
            {report.custom_questions.map((question, i) => {
              const answers = report.custom_answers[question] || []
              return (
                <div key={i} className="px-6 py-4">
                  <h3 className="font-medium text-gray-900">{question}</h3>
                  {answers.length > 0 ? (
                    <ul className="mt-3 space-y-3">
                      {answers.map((text, j) => (
                        <li key={j} className="rounded-lg bg-gray-50 p-3 text-gray-700">
                          &ldquo;{text}&rdquo;
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-gray-500 italic">No responses</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
