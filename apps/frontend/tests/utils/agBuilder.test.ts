import { describe, it, expect } from 'vitest'
import {
  joursEntre,
  verifierDelaiConvocation,
  MAJORITE_OPTIONS,
  DELAI_CONVOCATION_MIN,
} from '@/lib/agBuilder'

describe('joursEntre', () => {
  it('counts whole days between two dates', () => {
    expect(joursEntre('2026-04-01', '2026-04-22')).toBe(21)
    expect(joursEntre('2026-04-01', '2026-04-01')).toBe(0)
  })
  it('returns NaN on invalid input', () => {
    expect(Number.isNaN(joursEntre('nope', '2026-04-01'))).toBe(true)
  })
})

describe('verifierDelaiConvocation', () => {
  it('accepts exactly the legal minimum', () => {
    const r = verifierDelaiConvocation('2026-04-01', '2026-04-22')
    expect(r.ok).toBe(true)
    expect(r.jours).toBe(DELAI_CONVOCATION_MIN)
  })
  it('rejects a too-short notice with an explanatory message', () => {
    const r = verifierDelaiConvocation('2026-04-10', '2026-04-22')
    expect(r.ok).toBe(false)
    expect(r.jours).toBe(12)
    expect(r.message).toMatch(/annulable/)
  })
  it('flags invalid dates', () => {
    expect(verifierDelaiConvocation('', '2026-04-22').ok).toBe(false)
  })
})

describe('MAJORITE_OPTIONS', () => {
  it('covers the four majorities', () => {
    expect(MAJORITE_OPTIONS.map(o => o.value)).toEqual([
      'article_24',
      'article_25',
      'article_26',
      'unanimite',
    ])
  })
})
