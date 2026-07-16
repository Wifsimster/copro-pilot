import { describe, it, expect } from 'vitest'
import {
  isDuplicateTrimestre,
  suggestTrimestrielAmount,
  budgetOverrun,
  validateEcheance,
  evaluateStep,
} from '@/lib/appelFondsWizard'

const existing = [
  { trimestre: 1, annee: 2026, montant_total: 3000 },
  { trimestre: 2, annee: 2026, montant_total: 3000 },
]

describe('isDuplicateTrimestre', () => {
  it('detects an existing quarter', () => {
    expect(isDuplicateTrimestre(existing, 1, 2026)).toBe(true)
  })
  it('allows a new quarter', () => {
    expect(isDuplicateTrimestre(existing, 3, 2026)).toBe(false)
    expect(isDuplicateTrimestre(existing, 1, 2027)).toBe(false)
  })
})

describe('suggestTrimestrielAmount', () => {
  it('suggests a quarter of the annual budget', () => {
    expect(suggestTrimestrielAmount(12000)).toBe(3000)
  })
  it('returns null without a budget', () => {
    expect(suggestTrimestrielAmount(null)).toBeNull()
    expect(suggestTrimestrielAmount(0)).toBeNull()
  })
})

describe('budgetOverrun', () => {
  it('flags cumulated calls above the voted budget', () => {
    const r = budgetOverrun(existing, 2026, 7000, 12000)
    expect(r?.over).toBe(true)
    expect(r?.cumul).toBe(13000)
  })
  it('does not flag within budget', () => {
    expect(budgetOverrun(existing, 2026, 3000, 12000)?.over).toBe(false)
  })
  it('skips the check without a budget', () => {
    expect(budgetOverrun(existing, 2026, 9999, null)).toBeNull()
  })
})

describe('validateEcheance', () => {
  it('rejects an échéance before émission', () => {
    expect(validateEcheance('2026-04-10', '2026-04-01').ok).toBe(false)
  })
  it('accepts échéance on/after émission', () => {
    expect(validateEcheance('2026-04-01', '2026-05-01').ok).toBe(true)
  })
  it('requires both dates', () => {
    expect(validateEcheance('', '2026-05-01').ok).toBe(false)
  })
})

describe('evaluateStep', () => {
  const draft = {
    trimestre: 3,
    annee: 2026,
    montant_total: 3000,
    date_emission: '2026-07-01',
    date_echeance: '2026-07-31',
  }

  it('passes a clean période step', () => {
    const r = evaluateStep('periode', draft, { existing })
    expect(r.canProceed).toBe(true)
    expect(r.warnings).toHaveLength(0)
  })

  it('warns (not blocks) on a duplicate quarter', () => {
    const r = evaluateStep(
      'periode',
      { ...draft, trimestre: 1 },
      { existing }
    )
    expect(r.canProceed).toBe(true)
    expect(r.warnings[0]).toMatch(/existe déjà/)
  })

  it('blocks a zero amount', () => {
    const r = evaluateStep(
      'montant',
      { ...draft, montant_total: 0 },
      { existing }
    )
    expect(r.canProceed).toBe(false)
  })

  it('warns on budget overrun without blocking', () => {
    const r = evaluateStep(
      'montant',
      { ...draft, montant_total: 7000 },
      { existing, budgetAnnuel: 12000 }
    )
    expect(r.canProceed).toBe(true)
    expect(r.warnings[0]).toMatch(/dépasse le budget/)
  })

  it('blocks an échéance before émission', () => {
    const r = evaluateStep(
      'echeance',
      { ...draft, date_echeance: '2026-06-01' },
      { existing }
    )
    expect(r.canProceed).toBe(false)
  })
})
