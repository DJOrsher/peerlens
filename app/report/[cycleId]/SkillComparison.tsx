import { PM_SKILLS, SKILL_RATING_OPTIONS } from '@/types/database'
import type { SkillRating } from '@/types/database'
import type { PeerRatingData } from '@/lib/actions/report'

interface Props {
  selfRatings: Record<string, SkillRating>
  peerRatings: Record<string, PeerRatingData>
  gaps: Record<string, number | null>
}

const RATING_LABELS: Record<string, string> = {
  bottom_20: 'Bottom 20%',
  below_average: 'Below Avg',
  average: 'Average',
  above_average: 'Above Avg',
  top_20: 'Top 20%',
}

const RATING_NUMERIC: Record<string, number> = {
  bottom_20: 1,
  below_average: 2,
  average: 3,
  above_average: 4,
  top_20: 5,
}

function numericToLabel(num: number): string {
  if (num <= 1.5) return 'Bottom 20%'
  if (num <= 2.5) return 'Below Avg'
  if (num <= 3.5) return 'Average'
  if (num <= 4.5) return 'Above Avg'
  return 'Top 20%'
}

export function SkillComparison({ selfRatings, peerRatings, gaps }: Props) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Skill Comparison</h2>
        <p className="text-sm text-gray-500">Your self-assessment vs. peer feedback</p>
      </div>

      <div className="divide-y">
        {PM_SKILLS.map((skill) => {
          const selfRating = selfRatings[skill.id]
          const peerData = peerRatings[skill.id]
          const gap = gaps[skill.id]

          const selfNumeric = RATING_NUMERIC[selfRating] || null
          const peerAvg = peerData?.average

          // Gap interpretation
          let gapColor = 'text-gray-500'
          let gapLabel = ''
          if (gap !== null) {
            if (gap > 0.5) {
              gapColor = 'text-green-600'
              gapLabel = 'Peers rate you higher'
            } else if (gap < -0.5) {
              gapColor = 'text-amber-600'
              gapLabel = 'You rate yourself higher'
            } else {
              gapLabel = 'Aligned'
            }
          }

          return (
            <div key={skill.id} className="px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{skill.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{skill.description}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {/* Self rating */}
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500 uppercase">Your Rating</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {selfRating ? RATING_LABELS[selfRating] || selfRating : 'Not rated'}
                  </p>
                </div>

                {/* Peer rating */}
                <div className="rounded-lg bg-primary-50 p-3">
                  <p className="text-xs font-medium text-primary-600 uppercase">Peer Average</p>
                  {peerData?.response_count > 0 ? (
                    <>
                      <p className="mt-1 text-lg font-semibold text-primary-900">
                        {numericToLabel(peerAvg!)}
                      </p>
                      <p className="text-xs text-primary-600">
                        {peerData.response_count} rating{peerData.response_count !== 1 ? 's' : ''}
                        {peerData.cant_say_count > 0 && `, ${peerData.cant_say_count} can't say`}
                      </p>
                    </>
                  ) : (
                    <p className="mt-1 text-lg font-semibold text-gray-400">
                      {peerData?.cant_say_count > 0 ? `${peerData.cant_say_count} can't say` : 'No ratings'}
                    </p>
                  )}
                </div>
              </div>

              {/* Gap indicator */}
              {gap !== null && peerData?.response_count > 0 && (
                <div className={`mt-3 text-sm ${gapColor}`}>
                  <span className="font-medium">{gapLabel}</span>
                  {Math.abs(gap) > 0.5 && (
                    <span className="ml-1">
                      ({gap > 0 ? '+' : ''}{gap.toFixed(1)} difference)
                    </span>
                  )}
                </div>
              )}

              {/* Distribution for multiple responses */}
              {peerData?.response_count > 1 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Rating distribution:</p>
                  <div className="flex gap-1">
                    {Object.entries(RATING_LABELS).map(([key, label]) => {
                      const count = peerData.distribution[key] || 0
                      if (count === 0) return null
                      return (
                        <span
                          key={key}
                          className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                        >
                          {count} {label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
