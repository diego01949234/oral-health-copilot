// lib/scoring.test.ts
import { describe, it, expect } from 'vitest'
import { computeResult } from './scoring'
import { Answers } from '@/types'

const lowRiskAnswers: Answers = {
  q1: ['none'],
  q2: '2plus',
  q3: 'yes',
  q3a: 'daily',
  q4: 'rarely',
  q5: 'rarely',
  q6: 'never',
  q7: ['none'],
  q8: 'no',
  q9: '6mo',
  q10: ['regular'],
  q11: '18to39',
  q12: ['none'],
}

const highRiskAnswers: Answers = {
  q1: ['none'],
  q2: 'few',
  q3: 'no',
  q3a: 'never',
  q4: '3to4',
  q5: 'multi',
  q6: 'often',
  q7: ['receding', 'breath'],
  q8: 'regular',
  q9: '2plus',
  q10: ['cost', 'anxiety'],
  q11: '65plus',
  q12: ['diabetes'],
}

const escalateAnswers: Answers = {
  ...lowRiskAnswers,
  q1: ['pain', 'swelling'],
}

describe('computeResult', () => {
  it('returns low risk for healthy answers', () => {
    const result = computeResult(lowRiskAnswers)
    expect(result.riskLevel).toBe('low')
    expect(result.totalScore).toBeLessThanOrEqual(7)
    expect(result.redFlags).toHaveLength(0)
    expect(result.cariesScore).toBe(0)
    expect(result.perioScore).toBe(0)
    expect(result.accessScore).toBe(0)
  })

  it('returns high risk for poor answers', () => {
    const result = computeResult(highRiskAnswers)
    expect(result.riskLevel).toBe('high')
    expect(result.totalScore).toBeGreaterThanOrEqual(18)
  })

  it('returns escalate when red flags present', () => {
    const result = computeResult(escalateAnswers)
    expect(result.riskLevel).toBe('escalate')
    expect(result.redFlags).toContain('Severe or throbbing tooth or jaw pain')
    expect(result.redFlags).toContain('Facial swelling or puffiness')
  })

  it('still computes domain scores when red flag present', () => {
    const result = computeResult(escalateAnswers)
    expect(result.totalScore).toBeDefined()
    expect(typeof result.cariesScore).toBe('number')
  })

  it('returns patientSummary and dentistSummary strings', () => {
    const result = computeResult(lowRiskAnswers)
    expect(typeof result.patientSummary).toBe('string')
    expect(result.patientSummary.length).toBeGreaterThan(0)
    expect(typeof result.dentistSummary).toBe('string')
    expect(result.dentistSummary.length).toBeGreaterThan(0)
  })

  it('returns 2–4 recommendations', () => {
    const result = computeResult(highRiskAnswers)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2)
    expect(result.recommendations.length).toBeLessThanOrEqual(4)
  })

  it('dentistSummary includes score and domain breakdown', () => {
    const result = computeResult(highRiskAnswers)
    expect(result.dentistSummary).toContain('Caries:')
    expect(result.dentistSummary).toContain('Periodontal:')
    expect(result.dentistSummary).toContain('Access')
  })

  it('returns at least 2 recommendations even for low-risk users', () => {
    const result = computeResult(lowRiskAnswers)
    expect(result.recommendations.length).toBeGreaterThanOrEqual(2)
    expect(result.recommendations.length).toBeLessThanOrEqual(4)
  })
})
