// components/ResultCard.tsx
'use client'
import { useState } from 'react'
import { ScreeningResult, RiskLevel } from '@/types'
import { ChevronDown, ChevronUp, Copy, Check, RotateCcw, AlertTriangle } from 'lucide-react'

interface Props {
  result: ScreeningResult
  onRestart: () => void
}

const BADGE: Record<RiskLevel, { label: string; classes: string; pulse: boolean }> = {
  low:      { label: 'Low Risk',      classes: 'bg-emerald-100 text-emerald-800 border-emerald-200', pulse: false },
  moderate: { label: 'Moderate Risk', classes: 'bg-amber-100 text-amber-800 border-amber-200',       pulse: false },
  high:     { label: 'High Risk',     classes: 'bg-orange-100 text-orange-800 border-orange-200',    pulse: false },
  escalate: { label: 'Needs Attention', classes: 'bg-red-100 text-red-800 border-red-200',           pulse: true  },
}

export default function ResultCard({ result, onRestart }: Props) {
  const [clinicianOpen, setClinicianOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const badge = BADGE[result.riskLevel]

  async function handleCopy() {
    await navigator.clipboard.writeText(result.dentistSummary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Badge */}
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${badge.classes} ${badge.pulse ? 'animate-pulse' : ''}`}>
          {result.riskLevel === 'escalate' && <AlertTriangle className="w-3.5 h-3.5" />}
          {badge.label}
        </span>
      </div>

      {/* Patient summary */}
      <div className="flex flex-col gap-3">
        <p className="text-gray-700 leading-relaxed text-sm">{result.patientSummary}</p>

        {result.recommendations.length > 0 && (
          <ul className="flex flex-col gap-2">
            {result.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center flex-shrink-0 font-semibold">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Clinician section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setClinicianOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <span>Clinician summary</span>
          {clinicianOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {clinicianOpen && (
          <div className="px-4 py-4 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="text-gray-500">Risk level</div>
              <div className="font-medium text-gray-900">{result.riskLevel.toUpperCase()}</div>
              <div className="text-gray-500">Total score</div>
              <div className="font-medium text-gray-900">{result.totalScore}/36</div>
              <div className="text-gray-500">Caries</div>
              <div className="font-medium text-gray-900">{result.cariesScore}/13</div>
              <div className="text-gray-500">Periodontal</div>
              <div className="font-medium text-gray-900">{result.perioScore}/12</div>
              <div className="text-gray-500">Access</div>
              <div className="font-medium text-gray-900">{result.accessScore}/7</div>
            </div>

            {result.redFlags.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-red-700">Red flags</p>
                <ul className="flex flex-col gap-0.5">
                  {result.redFlags.map((f, i) => (
                    <li key={i} className="text-xs text-red-700">• {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.riskFactors.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-600">Risk factors</p>
                <ul className="flex flex-col gap-0.5">
                  {result.riskFactors.map((f, i) => (
                    <li key={i} className="text-xs text-gray-600">• {f}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.contextFlags.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-gray-600">Context</p>
                <p className="text-xs text-gray-600">{result.contextFlags.join(', ')}</p>
              </div>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 self-start px-3 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy summary'}
            </button>
          </div>
        )}
      </div>

      {/* Restart */}
      <button
        onClick={onRestart}
        className="flex items-center gap-1.5 self-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Start over
      </button>
    </div>
  )
}
