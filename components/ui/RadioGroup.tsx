'use client'

interface RadioOption {
  value: string
  label: string
  description?: string
}

interface RadioGroupProps<T extends string> {
  options: readonly RadioOption[]
  value: T | ''
  onChange: (value: T) => void
  name?: string
}

export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
  name,
}: RadioGroupProps<T>) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label={name}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value as T)}
          className={`w-full flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
            value === option.value
              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
              value === option.value
                ? 'border-primary-600 bg-primary-600'
                : 'border-gray-300'
            }`}
          >
            {value === option.value && (
              <div className="h-2 w-2 rounded-full bg-white" />
            )}
          </div>
          <div>
            <span className="font-medium text-gray-900">{option.label}</span>
            {option.description && (
              <span className="ml-2 text-gray-500">— {option.description}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
