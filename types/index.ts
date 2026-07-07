export type Domain = 'redFlag' | 'caries' | 'perio' | 'access' | 'context'
export type RiskLevel = 'low' | 'moderate' | 'high' | 'escalate'
export type Phase = 'intro' | 'questions' | 'results'

export interface QuestionOption {
  label: string
  value: string
  score: number
  redFlag?: boolean
}

export interface Question {
  id: string
  domain: Domain
  text: string
  subtext?: string
  type: 'single' | 'multi'
  options: QuestionOption[]
}

export type Answers = Record<string, string | string[]>

export interface ScreeningResult {
  riskLevel: RiskLevel
  totalScore: number
  redFlags: string[]
  riskFactors: string[]
  cariesScore: number
  perioScore: number
  accessScore: number
  contextFlags: string[]
  patientSummary: string
  dentistSummary: string
  recommendations: string[]
}
