'use client'
import { useState } from 'react'
import { Phase, Answers, ScreeningResult } from '@/types'
import { questions } from '@/lib/questions'
import { computeResult } from '@/lib/scoring'
import Questionnaire from '@/components/Questionnaire'
import ResultCard from '@/components/ResultCard'
import { Activity } from 'lucide-react'

export default function Home() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [result, setResult] = useState<ScreeningResult | null>(null)

  function handleComplete(answers: Answers) {
    setResult(computeResult(answers))
    setPhase('results')
  }

  function handleRestart() {
    setResult(null)
    setPhase('intro')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">Oral Health Copilot</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {phase === 'intro' && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  Preventive oral health screening
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Answer 13 short questions about your oral health habits. You will get a
                  personalised risk summary and clear next steps — in about 3 minutes.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>This is not a diagnosis.</strong> It is a preventive screening tool.
                  Your answers help identify risk indicators and guide next steps — they do not
                  replace a dental examination.
                </p>
              </div>

              <button
                onClick={() => setPhase('questions')}
                className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start screening
              </button>
            </div>
          )}

          {phase === 'questions' && (
            <Questionnaire questions={questions} onComplete={handleComplete} />
          )}

          {phase === 'results' && result && (
            <ResultCard result={result} onRestart={handleRestart} />
          )}

        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Oral Health Copilot · Not a clinical diagnosis
        </p>
      </div>
    </main>
  )
}
