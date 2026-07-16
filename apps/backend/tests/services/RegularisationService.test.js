import { describe, it, expect } from 'vitest'
import { computeRegularisation } from '../../src/services/RegularisationService.js'

const lots = [
  { id: 1, tantiemes: 500 },
  { id: 2, tantiemes: 300 },
  { id: 3, tantiemes: 200 },
]

describe('computeRegularisation (server-side)', () => {
  it('splits real charges by tantièmes and computes soldes', () => {
    const r = computeRegularisation(lots, 10000, 12000)
    expect(r.lignes[0].quote_part).toBe(5000)
    expect(r.lignes[0].provisions).toBe(6000)
    expect(r.lignes[0].solde).toBe(1000)
    expect(r.lignes[0].sens).toBe('crediteur')
    expect(r.solde_global).toBe(2000)
    expect(r.total_remboursements).toBe(2000)
    expect(r.total_complements).toBe(0)
  })

  it('is cent-exact — shares sum exactly to the total', () => {
    const equal = [
      { id: 1, tantiemes: 1 },
      { id: 2, tantiemes: 1 },
      { id: 3, tantiemes: 1 },
    ]
    const r = computeRegularisation(equal, 100, 0)
    const sum = r.lignes.reduce((s, l) => s + l.quote_part, 0)
    expect(sum).toBe(100)
  })

  it('produces débiteurs when provisions fall short', () => {
    const r = computeRegularisation(lots, 12000, 10000)
    expect(r.solde_global).toBe(-2000)
    expect(r.total_complements).toBe(2000)
    expect(r.lignes[0].sens).toBe('debiteur')
  })

  it('rejects empty lots and non-positive tantièmes', () => {
    expect(() => computeRegularisation([], 100, 100)).toThrow(/Aucun lot/)
    expect(() =>
      computeRegularisation([{ id: 1, tantiemes: 0 }], 100, 100)
    ).toThrow(/tantièmes/)
  })

  it('rejects negative amounts', () => {
    expect(() => computeRegularisation(lots, -1, 100)).toThrow(/positifs/)
  })
})
