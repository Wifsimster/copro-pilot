import { describe, it, expect } from 'vitest'
import { generateResolutionText } from '@/lib/resolutionAg'

const base = {
  coproName: 'Résidence Les Tilleuls',
  plan: 'Essentiel',
  prixAnnuel: 144,
  exercice: 2026,
} as const

describe('generateResolutionText', () => {
  it('includes the copro, plan, price and exercice', () => {
    const text = generateResolutionText(base)
    expect(text).toContain('Résidence Les Tilleuls')
    expect(text).toContain('Essentiel')
    expect(text).toContain('144,00 €')
    expect(text).toContain('2026')
    expect(text).toContain('article 24')
  })

  it('supports the article 25 majority', () => {
    const text = generateResolutionText({ ...base, majorite: '25' })
    expect(text).toContain('article 25')
  })

  it('rejects a missing copro name', () => {
    expect(() =>
      generateResolutionText({ ...base, coproName: '  ' })
    ).toThrow(/copropriété/)
  })

  it('rejects a negative price', () => {
    expect(() =>
      generateResolutionText({ ...base, prixAnnuel: -1 })
    ).toThrow(/prix/)
  })

  it('rejects an invalid exercice', () => {
    expect(() =>
      generateResolutionText({ ...base, exercice: 42 })
    ).toThrow(/exercice/)
  })
})
