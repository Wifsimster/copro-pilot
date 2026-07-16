import { describe, it, expect } from 'vitest'
import { computeRegularisation } from '@/lib/regularisationCharges'

const lots = [
  { id: 1, numero: 'A1', tantiemes: 500 },
  { id: 2, numero: 'A2', tantiemes: 300 },
  { id: 3, numero: 'A3', tantiemes: 200 },
]

describe('computeRegularisation', () => {
  it('splits real charges by tantièmes and computes soldes', () => {
    // charges 10 000, provisions 12 000 -> excédent 2 000 to refund
    const r = computeRegularisation(lots, 10000, 12000)
    expect(r.totalTantiemes).toBe(1000)
    expect(r.lignes[0].quotePart).toBe(5000) // 500/1000 * 10000
    expect(r.lignes[0].provisions).toBe(6000)
    expect(r.lignes[0].solde).toBe(1000) // créditeur
    expect(r.lignes[0].sens).toBe('crediteur')
    expect(r.soldeGlobal).toBe(2000)
    expect(r.totalRemboursements).toBe(2000)
    expect(r.totalComplements).toBe(0)
  })

  it('produces débiteurs when provisions fall short', () => {
    const r = computeRegularisation(lots, 12000, 10000)
    expect(r.soldeGlobal).toBe(-2000)
    expect(r.lignes[0].sens).toBe('debiteur')
    expect(r.totalComplements).toBe(2000)
    expect(r.totalRemboursements).toBe(0)
  })

  it('is cent-exact — per-lot shares sum exactly to the total (no drift)', () => {
    // 100 / 3 lots equal tantièmes: 33.34 + 33.33 + 33.33 = 100.00
    const equal = [
      { id: 1, numero: 'A', tantiemes: 1 },
      { id: 2, numero: 'B', tantiemes: 1 },
      { id: 3, numero: 'C', tantiemes: 1 },
    ]
    const r = computeRegularisation(equal, 100, 0)
    const sum = r.lignes.reduce((s, l) => s + l.quotePart, 0)
    expect(sum).toBe(100)
    expect(r.lignes.map(l => l.quotePart).sort()).toEqual([33.33, 33.33, 33.34])
  })

  it('uses per-lot provisions when all are provided', () => {
    const withProv = [
      { id: 1, numero: 'A1', tantiemes: 500, provisionsPayees: 7000 },
      { id: 2, numero: 'A2', tantiemes: 300, provisionsPayees: 3000 },
      { id: 3, numero: 'A3', tantiemes: 200, provisionsPayees: 2000 },
    ]
    const r = computeRegularisation(withProv, 10000, 0)
    expect(r.totalProvisions).toBe(12000)
    expect(r.lignes[0].provisions).toBe(7000)
    expect(r.lignes[0].solde).toBe(2000) // 7000 - 5000
  })

  it('rejects empty lots and non-positive tantièmes', () => {
    expect(() => computeRegularisation([], 100, 100)).toThrow(/Aucun lot/)
    expect(() =>
      computeRegularisation([{ id: 1, numero: 'X', tantiemes: 0 }], 100, 100)
    ).toThrow(/tantièmes/)
  })

  it('rejects negative amounts', () => {
    expect(() => computeRegularisation(lots, -1, 100)).toThrow(/positifs/)
  })
})
