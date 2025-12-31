/**
 * Preset answer scales that can be copied to questions
 * These are stored in code and can be applied to any question
 */

export interface PresetOption {
  value: string
  label: string
  description: string
  is_separator: boolean
}

export interface PresetScale {
  id: string
  name: string
  description: string
  options: PresetOption[]
}

export const PRESET_SCALES: PresetScale[] = [
  {
    id: 'rating',
    name: 'Comparative Rating',
    description: 'Compare against peers (Bottom 20% to Top 20%)',
    options: [
      { value: 'bottom_20', label: 'Bottom 20%', description: 'Noticeably weaker than most', is_separator: false },
      { value: 'below_average', label: 'Below average', description: 'Some gaps compared to peers', is_separator: false },
      { value: 'average', label: 'Average', description: 'About the same as most', is_separator: false },
      { value: 'above_average', label: 'Above average', description: 'Better than most', is_separator: false },
      { value: 'top_20', label: 'Top 20%', description: 'Among the best I\'ve seen', is_separator: false },
      { value: 'cant_say', label: 'Not sure', description: 'I haven\'t seen enough to judge', is_separator: true },
    ],
  },
  {
    id: 'agreement',
    name: 'Agreement Scale',
    description: 'Agree or disagree with a statement',
    options: [
      { value: 'strongly_disagree', label: 'Strongly disagree', description: '', is_separator: false },
      { value: 'disagree', label: 'Disagree', description: '', is_separator: false },
      { value: 'neutral', label: 'Neutral', description: '', is_separator: false },
      { value: 'agree', label: 'Agree', description: '', is_separator: false },
      { value: 'strongly_agree', label: 'Strongly agree', description: '', is_separator: false },
      { value: 'not_applicable', label: 'N/A', description: 'Not applicable', is_separator: true },
    ],
  },
  {
    id: 'frequency',
    name: 'Frequency Scale',
    description: 'How often something occurs',
    options: [
      { value: 'never', label: 'Never', description: '', is_separator: false },
      { value: 'rarely', label: 'Rarely', description: '', is_separator: false },
      { value: 'sometimes', label: 'Sometimes', description: '', is_separator: false },
      { value: 'often', label: 'Often', description: '', is_separator: false },
      { value: 'always', label: 'Always', description: '', is_separator: false },
      { value: 'not_applicable', label: 'N/A', description: 'Not applicable', is_separator: true },
    ],
  },
  {
    id: 'satisfaction',
    name: 'Satisfaction Scale',
    description: 'Level of satisfaction',
    options: [
      { value: 'very_dissatisfied', label: 'Very dissatisfied', description: '', is_separator: false },
      { value: 'dissatisfied', label: 'Dissatisfied', description: '', is_separator: false },
      { value: 'neutral', label: 'Neutral', description: '', is_separator: false },
      { value: 'satisfied', label: 'Satisfied', description: '', is_separator: false },
      { value: 'very_satisfied', label: 'Very satisfied', description: '', is_separator: false },
    ],
  },
  {
    id: 'yes_no',
    name: 'Yes/No',
    description: 'Simple yes or no answer',
    options: [
      { value: 'yes', label: 'Yes', description: '', is_separator: false },
      { value: 'no', label: 'No', description: '', is_separator: false },
      { value: 'not_sure', label: 'Not sure', description: '', is_separator: true },
    ],
  },
]

export function getPresetById(id: string): PresetScale | undefined {
  return PRESET_SCALES.find((p) => p.id === id)
}

export function getDefaultPreset(): PresetScale {
  return PRESET_SCALES[0] // rating
}
