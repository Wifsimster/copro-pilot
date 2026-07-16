import { describe, it, expect } from 'vitest'
import { computeCashBasisStatement } from '../../src/services/ComptaTresorerieService.js'

describe('computeCashBasisStatement', () => {
  it('sums recettes, dépenses and solde', () => {
    const r = computeCashBasisStatement([
      { type: 'credit', montant: 1200, categorie: 'Appels de fonds' },
      { type: 'debit', montant: 300, categorie: 'Entretien' },
      { type: 'debit', montant: 200, categorie: 'Assurance' },
    ])
    expect(r.recettes).toBe(1200)
    expect(r.depenses).toBe(500)
    expect(r.solde).toBe(700)
  })

  it('breaks down by category', () => {
    const r = computeCashBasisStatement([
      { type: 'credit', montant: 500, categorie: 'Appels de fonds' },
      { type: 'credit', montant: 500, categorie: 'Appels de fonds' },
      { type: 'debit', montant: 150, categorie: 'Entretien' },
    ])
    expect(r.parCategorie['Appels de fonds']).toEqual({
      recettes: 1000,
      depenses: 0,
    })
    expect(r.parCategorie['Entretien']).toEqual({
      recettes: 0,
      depenses: 150,
    })
  })

  it('is cent-exact (no float drift)', () => {
    const r = computeCashBasisStatement([
      { type: 'credit', montant: 0.1 },
      { type: 'credit', montant: 0.2 },
    ])
    expect(r.recettes).toBe(0.3)
  })

  it('labels uncategorised movements', () => {
    const r = computeCashBasisStatement([{ type: 'debit', montant: 50 }])
    expect(r.parCategorie['Non catégorisé'].depenses).toBe(50)
  })

  it('handles an empty list', () => {
    const r = computeCashBasisStatement([])
    expect(r).toEqual({
      recettes: 0,
      depenses: 0,
      solde: 0,
      parCategorie: {},
    })
  })
})
