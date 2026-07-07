// lib/scoring.ts
import { Answers, ScreeningResult, RiskLevel } from '@/types'
import { questions } from './questions'

function getMultiValues(answers: Answers, id: string): string[] {
  const v = answers[id]
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function getSingleValue(answers: Answers, id: string): string {
  const v = answers[id]
  return Array.isArray(v) ? v[0] : (v ?? '')
}

function scoreQuestion(id: string, answers: Answers): number {
  const q = questions.find(q => q.id === id)
  if (!q) return 0
  if (q.type === 'single') {
    const val = getSingleValue(answers, id)
    return q.options.find(o => o.value === val)?.score ?? 0
  }
  const vals = getMultiValues(answers, id)
  return vals.reduce((sum, val) => {
    const opt = q.options.find(o => o.value === val)
    return sum + (opt?.score ?? 0)
  }, 0)
}

function detectRedFlags(answers: Answers): string[] {
  const q = questions.find(q => q.id === 'q1')!
  const selected = getMultiValues(answers, 'q1')
  return selected
    .map(val => q.options.find(o => o.value === val))
    .filter(opt => opt?.redFlag)
    .map(opt => opt!.label)
}

function scoreCaries(answers: Answers): number {
  return ['q2', 'q3', 'q3a', 'q4', 'q5'].reduce(
    (sum, id) => sum + scoreQuestion(id, answers), 0
  )
}

function scorePerio(answers: Answers): number {
  return ['q6', 'q7', 'q8'].reduce(
    (sum, id) => sum + scoreQuestion(id, answers), 0
  )
}

function scoreAccess(answers: Answers): number {
  return ['q9', 'q10'].reduce(
    (sum, id) => sum + scoreQuestion(id, answers), 0
  )
}

function scoreContext(answers: Answers): number {
  return ['q11', 'q12'].reduce(
    (sum, id) => sum + scoreQuestion(id, answers), 0
  )
}

function deriveRiskFactors(answers: Answers): string[] {
  const factors: string[] = []
  const q2 = getSingleValue(answers, 'q2')
  if (q2 === 'few' || q2 === 'rarely') factors.push('Brushes less than twice daily')
  if (getSingleValue(answers, 'q3') === 'no') factors.push('No fluoride toothpaste')
  const q3a = getSingleValue(answers, 'q3a')
  if (q3a === 'rarely' || q3a === 'never') factors.push('Rare or no interdental cleaning')
  const q4 = getSingleValue(answers, 'q4')
  if (q4 === '3to4' || q4 === '4plus') factors.push('High sugar frequency')
  if (getSingleValue(answers, 'q5') === 'multi') factors.push('High acidic drink frequency')
  const q6 = getSingleValue(answers, 'q6')
  if (q6 === 'occasionally' || q6 === 'often') factors.push('Gums bleed when brushing or flossing')
  const q7 = getMultiValues(answers, 'q7').filter(v => v !== 'none')
  if (q7.length > 0) factors.push('Periodontal symptom reported')
  const q8 = getSingleValue(answers, 'q8')
  if (q8 === 'occasional' || q8 === 'regular') factors.push('Current tobacco use')
  const q9 = getSingleValue(answers, 'q9')
  if (q9 === '2plus' || q9 === 'never') factors.push('No dental visit in 2+ years')
  else if (q9 === '2yr') factors.push('No dental visit in 1–2 years')
  const q10 = getMultiValues(answers, 'q10').filter(v => v !== 'none' && v !== 'regular')
  if (q10.length > 0) factors.push('Access barrier to dental care')
  return factors
}

function deriveContextFlags(answers: Answers): string[] {
  const flags: string[] = []
  if (getSingleValue(answers, 'q11') === '65plus') flags.push('Age 65+')
  const q12 = getMultiValues(answers, 'q12')
  if (q12.includes('pregnant')) flags.push('Pregnant')
  if (q12.includes('diabetes')) flags.push('Diabetes')
  if (q12.includes('immune')) flags.push('Immune system condition')
  if (q12.includes('drymouth')) flags.push('Dry mouth medications')
  return flags
}

const ALL_RECOMMENDATIONS: Record<string, string> = {
  'Brushes less than twice daily': 'Brush twice daily using fluoride toothpaste',
  'No fluoride toothpaste': 'Switch to a fluoride toothpaste — it is the most effective cavity prevention tool',
  'Rare or no interdental cleaning': 'Clean between teeth daily — floss or an interdental brush both work',
  'High sugar frequency': 'Try to limit sugary foods and drinks to mealtimes',
  'High acidic drink frequency': 'Try to limit acidic beverages and rinse with water after',
  'Gums bleed when brushing or flossing': 'Bleeding gums are worth mentioning at your next dental visit',
  'Periodontal symptom reported': 'Schedule a dental evaluation to assess the symptoms you reported',
  'Current tobacco use': 'Talk to your doctor or dentist about quitting tobacco',
  'No dental visit in 2+ years': 'Schedule a dental visit — it has been a while',
  'No dental visit in 1–2 years': 'Schedule a dental visit — it has been a while',
  'Access barrier to dental care': 'Many clinics offer low-cost or sliding-scale dental care',
}

function selectRecommendations(riskFactors: string[], riskLevel: RiskLevel): string[] {
  const recs = riskFactors
    .map(f => ALL_RECOMMENDATIONS[f])
    .filter(Boolean)
  if (riskLevel === 'escalate' || riskLevel === 'high') {
    if (!recs.includes('Schedule a dental visit — it has been a while') &&
        !recs.some(r => r.includes('evaluation'))) {
      recs.unshift('Schedule a dental visit soon')
    }
  }
  return recs.slice(0, 4)
}

function buildPatientSummary(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'low':
      return 'Your responses suggest a low level of oral health risk. Keep up your current habits — brushing, cleaning between teeth, and seeing your dentist regularly are your best prevention tools.'
    case 'moderate':
      return 'Your responses highlight a few areas worth some attention. Small, consistent changes to your daily routine can make a real difference. Consider scheduling a dental visit if it has been a while.'
    case 'high':
      return 'Your responses suggest several risk indicators that are worth discussing with a dental professional. This is not a diagnosis — it is a prompt to get a preventive check-up.'
    case 'escalate':
      return 'This may need prompt professional attention. Please contact a dentist or clinic soon. If you have facial swelling, severe pain, or difficulty breathing, seek care today.'
  }
}

function buildDentistSummary(args: {
  riskLevel: RiskLevel
  totalScore: number
  cariesScore: number
  perioScore: number
  accessScore: number
  redFlags: string[]
  riskFactors: string[]
  contextFlags: string[]
}): string {
  const { riskLevel, totalScore, cariesScore, perioScore, accessScore,
    redFlags, riskFactors, contextFlags } = args

  const followUp: Record<RiskLevel, string> = {
    low: 'Routine — next scheduled visit',
    moderate: 'Timely — within 3 months',
    high: 'Soon — within 1 month',
    escalate: 'Urgent — today or this week',
  }

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  return [
    `ORAL HEALTH SCREENING SUMMARY`,
    `Date: ${date}`,
    `Risk Level: ${riskLevel.toUpperCase()}`,
    `Total Score: ${totalScore}/36`,
    ``,
    `Red Flags: ${redFlags.length > 0 ? redFlags.join(', ') : 'None'}`,
    `Risk Factors: ${riskFactors.length > 0 ? riskFactors.join(', ') : 'None'}`,
    `Context: ${contextFlags.length > 0 ? contextFlags.join(', ') : 'None'}`,
    ``,
    `Domain Scores:`,
    `  Caries: ${cariesScore}/13`,
    `  Periodontal: ${perioScore}/12`,
    `  Access/Behavior: ${accessScore}/7`,
    ``,
    `Suggested Follow-Up: ${followUp[riskLevel]}`,
    ``,
    `---`,
    `Generated by Oral Health Copilot. Not a clinical diagnosis.`,
  ].join('\n')
}

export function computeResult(answers: Answers): ScreeningResult {
  const redFlags = detectRedFlags(answers)
  const cariesScore = scoreCaries(answers)
  const perioScore = scorePerio(answers)
  const accessScore = scoreAccess(answers)
  const contextMod = Math.min(scoreContext(answers), 4)
  const totalScore = cariesScore + perioScore + accessScore + contextMod

  const riskLevel: RiskLevel =
    redFlags.length > 0 ? 'escalate'
    : totalScore <= 7 ? 'low'
    : totalScore <= 17 ? 'moderate'
    : 'high'

  const riskFactors = deriveRiskFactors(answers)
  const contextFlags = deriveContextFlags(answers)
  const recommendations = selectRecommendations(riskFactors, riskLevel)
  const patientSummary = buildPatientSummary(riskLevel)
  const dentistSummary = buildDentistSummary({
    riskLevel, totalScore, cariesScore, perioScore, accessScore,
    redFlags, riskFactors, contextFlags,
  })

  return {
    riskLevel, totalScore, redFlags, riskFactors,
    cariesScore, perioScore, accessScore, contextFlags,
    patientSummary, dentistSummary, recommendations,
  }
}
