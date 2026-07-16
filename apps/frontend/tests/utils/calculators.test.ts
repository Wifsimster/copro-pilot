import { describe, it, expect } from 'vitest'
import { computeQuotePart } from '@/lib/calculators'

describe('computeQuotePart', () => {
  it('computes the share, percentage and amount', () => {
    const r = computeQuotePart({
      totalTantiemes: 1000,
      lotTantiemes: 150,
      montantTotal: 12000,
    })
    expect(r.ratio).toBeCloseTo(0.15)
    expect(r.pourcentage).toBe(15)
    expect(r.quotePart).toBe(1800)
  })

  it('rounds the amount to the cent', () => {
    const r = computeQuotePart({
      totalTantiemes: 10000,
      lotTantiemes: 333,
      montantTotal: 1000,
    })
    expect(r.quotePart).toBe(33.3)
    expect(r.pourcentage).toBe(3.33)
  })

  it('handles a zero-tantième lot', () => {
    const r = computeQuotePart({
      totalTantiemes: 1000,
      lotTantiemes: 0,
      montantTotal: 5000,
    })
    expect(r.quotePart).toBe(0)
  })

  it('rejects a non-positive total', () => {
    expect(() =>
      computeQuotePart({
        totalTantiemes: 0,
        lotTantiemes: 10,
        montantTotal: 100,
      })
    ).toThrow(/total des tantièmes/)
  })

  it('rejects a lot larger than the total', () => {
    expect(() =>
      computeQuotePart({
        totalTantiemes: 1000,
        lotTantiemes: 1200,
        montantTotal: 100,
      })
    ).toThrow(/dépasser le total/)
  })

  it('rejects a negative amount', () => {
    expect(() =>
      computeQuotePart({
        totalTantiemes: 1000,
        lotTantiemes: 100,
        montantTotal: -5,
      })
    ).toThrow(/montant/)
  })
})
