import type { AnonymousReport, AnonymousResponseData } from '@/lib/actions/report'
import { SkillComparison } from './SkillComparison'
import { PM_SKILLS } from '@/types/database'

interface Props {
  report: AnonymousReport
}

const RATING_LABELS: Record<string, string> = {
  bottom_20: 'Bottom 20%',
  below_average: 'Below Avg',
  average: 'Average',
  above_average: 'Above Avg',
  top_20: 'Top 20%',
  cant_say: "Can't say",
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  team: 'Team member',
  cross_functional: 'Cross-functional',
  manager: 'Manager',
  peer_pm: 'Peer PM',
  other: 'Other',
}

const CLOSENESS_LABELS: Record<string, string> = {
  very_close: 'Very closely',
  somewhat: 'Somewhat',
  not_much: 'Not much',
  barely: 'Barely',
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

      {/* Individual responses (anonymous - no identity shown) */}
      {report.responses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Individual Responses</h2>
          <p className="text-sm text-gray-500">
            Each response is shown individually. The order is randomized to protect anonymity.
          </p>

          {report.responses.map((response, index) => (
            <AnonymousResponseCard
              key={index}
              response={response}
              selfRatings={report.self_ratings}
              customQuestions={report.custom_questions}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AnonymousResponseCard({
  response,
  selfRatings,
  customQuestions,
  index,
}: {
  response: AnonymousResponseData
  selfRatings: Record<string, string>
  customQuestions: string[]
  index: number
}) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      {/* Header - no identity, just metadata */}
      <div className="bg-gray-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Respondent #{index + 1}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{RELATIONSHIP_LABELS[response.relationship] || response.relationship}</p>
            <p>Worked together: {CLOSENESS_LABELS[response.closeness] || response.closeness}</p>
          </div>
        </div>
      </div>

      {/* Skill ratings */}
      <div className="px-6 py-4 border-b">
        <h4 className="font-medium text-gray-900 mb-3">Skill Ratings</h4>
        <div className="grid grid-cols-2 gap-3">
          {PM_SKILLS.map((skill) => {
            const peerRating = response.skill_ratings[skill.id]
            const selfRating = selfRatings[skill.id]
            const isSame = peerRating === selfRating
            const isHigher = peerRating && selfRating &&
              getRatingValue(peerRating) > getRatingValue(selfRating)

            return (
              <div key={skill.id} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-600">{skill.name}</span>
                <span className={`text-sm font-medium ${
                  peerRating === 'cant_say' ? 'text-gray-400' :
                  isHigher ? 'text-green-600' :
                  isSame ? 'text-gray-700' :
                  'text-amber-600'
                }`}>
                  {RATING_LABELS[peerRating] || peerRating || 'Not rated'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Open-ended feedback */}
      <div className="px-6 py-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900">What to keep doing:</h4>
          <p className="mt-1 text-gray-700">{response.keep_doing}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900">What to improve:</h4>
          <p className="mt-1 text-gray-700">{response.improve}</p>
        </div>

        {response.anything_else && (
          <div>
            <h4 className="text-sm font-medium text-gray-900">Additional comments:</h4>
            <p className="mt-1 text-gray-700">{response.anything_else}</p>
          </div>
        )}

        {/* Custom question answers */}
        {customQuestions.map((question, i) => {
          const answer = response.custom_answers[i]
          if (!answer) return null
          return (
            <div key={i}>
              <h4 className="text-sm font-medium text-gray-900">{question}</h4>
              <p className="mt-1 text-gray-700">{answer}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getRatingValue(rating: string): number {
  const values: Record<string, number> = {
    bottom_20: 1,
    below_average: 2,
    average: 3,
    above_average: 4,
    top_20: 5,
  }
  return values[rating] || 0
}
