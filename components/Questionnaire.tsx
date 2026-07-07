'use client'
import { useState } from 'react'
import { Question as QuestionType, Answers } from '@/types'
import Question from './Question'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface Props {
  questions: QuestionType[]
  onComplete: (answers: Answers) => void
}

export default function Questionnaire({ questions, onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})

  const current = questions[step]
  const answer = answers[current.id]
  const total = questions.length

  const hasAnswer =
    current.type === 'single'
      ? typeof answer === 'string' && answer.length > 0
      : Array.isArray(answer) && answer.length > 0

  function handleChange(value: string | string[]) {
    setAnswers(prev => ({ ...prev, [current.id]: value }))
  }

  function handleNext() {
    if (!hasAnswer) return
    if (step === total - 1) {
      onComplete(answers)
    } else {
      setStep(s => s + 1)
    }
  }

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
  }

  const progress = ((step + 1) / total) * 100

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>Question {step + 1} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-gray-900 leading-snug">
          {current.text}
        </h2>
        {current.subtext && (
          <p className="text-sm text-gray-500">{current.subtext}</p>
        )}
      </div>

      {/* Options */}
      <Question question={current} answer={answer} onChange={handleChange} />

      {/* Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-0 disabled:pointer-events-none transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!hasAnswer}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          {step === total - 1 ? 'See results' : 'Next'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
