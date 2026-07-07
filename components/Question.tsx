'use client'
import { Question as QuestionType, QuestionOption } from '@/types'
import { Check } from 'lucide-react'

interface Props {
  question: QuestionType
  answer: string | string[] | undefined
  onChange: (value: string | string[]) => void
}

function SingleSelect({ options, selected, onChange }: {
  options: QuestionOption[]
  selected: string | undefined
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
            selected === opt.value
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MultiSelect({ options, selected, onChange }: {
  options: QuestionOption[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(value: string) {
    if (value === 'none') {
      onChange(['none'])
      return
    }
    const withoutNone = selected.filter(v => v !== 'none')
    if (withoutNone.includes(value)) {
      onChange(withoutNone.filter(v => v !== value))
    } else {
      onChange([...withoutNone, value])
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {options.map(opt => {
        const isSelected = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-between ${
              isSelected
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <span>{opt.label}</span>
            {isSelected && <Check className="w-4 h-4 flex-shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}

export default function Question({ question, answer, onChange }: Props) {
  if (question.type === 'single') {
    return (
      <SingleSelect
        options={question.options}
        selected={answer as string | undefined}
        onChange={onChange}
      />
    )
  }
  return (
    <MultiSelect
      options={question.options}
      selected={(answer as string[] | undefined) ?? []}
      onChange={onChange}
    />
  )
}
