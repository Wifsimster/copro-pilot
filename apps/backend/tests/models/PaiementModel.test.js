import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests for PaiementModel.getSoldeCoproprietaire.
 * Verifies the solde calculation: total_du - total_paye.
 * Convention: a positive solde means the copropriétaire owes money
 * (débiteur), matching the export services and the extranet frontend.
 */

let dbCallIndex = 0
let dbCallResults = []

function makeChain(resolvedValue) {
  const isArray = Array.isArray(resolvedValue)
  const chain = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    del: vi.fn().mockResolvedValue(1),
    returning: vi.fn().mockResolvedValue(
      isArray ? resolvedValue : [resolvedValue]
    ),
    first: vi.fn().mockResolvedValue(
      isArray ? resolvedValue[0] : resolvedValue
    ),
    orderBy: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    count: vi.fn().mockReturnThis(),
    sum: vi.fn().mockReturnThis(),
    then(resolve) {
      return Promise.resolve(
        resolve(isArray ? resolvedValue : [resolvedValue])
      )
    },
  }
  return chain
}

const mockKnex = vi.fn(() => {
  const result = dbCallResults[dbCallIndex] ?? dbCallResults[dbCallResults.length - 1]
  dbCallIndex++
  return makeChain(result)
})

mockKnex.fn = { now: vi.fn().mockReturnValue('NOW()') }
mockKnex.raw = vi.fn().mockResolvedValue({ rows: [] })
mockKnex.transaction = vi.fn(async callback => callback(mockKnex))

vi.mock('../../src/config/knex-database.js', () => ({
  default: {
    getKnex: () => mockKnex,
  },
}))

const { PaiementModel } = await import('../../src/models/Paiement.js')

beforeEach(() => {
  vi.clearAllMocks()
  dbCallIndex = 0
  dbCallResults = []
})

// ─── getSoldeCoproprietaire ──────────────────────────────────────────

describe('PaiementModel.getSoldeCoproprietaire', () => {
  it('returns correct solde when both dues and payments exist', async () => {
    // First call: appels_fonds_lignes sum => { total: '3000' }
    // Second call: paiements sum => { total: '2000' }
    dbCallResults = [
      [{ total: '3000' }],
      [{ total: '2000' }],
    ]

    const result = await PaiementModel.getSoldeCoproprietaire(1)

    expect(result).toEqual({
      total_du: 3000,
      total_paye: 2000,
      solde: 1000, // 3000 - 2000 => débiteur owes 1000
    })

    // Verify correct tables were queried
    expect(mockKnex).toHaveBeenCalledWith('appels_fonds_lignes')
    expect(mockKnex).toHaveBeenCalledWith('paiements')
  })

  it('returns positive solde when no payments exist (full debtor)', async () => {
    // Dues exist but no payments (sum returns null)
    dbCallResults = [
      [{ total: '5000' }],
      [{ total: null }],
    ]

    const result = await PaiementModel.getSoldeCoproprietaire(1)

    expect(result).toEqual({
      total_du: 5000,
      total_paye: 0,
      solde: 5000, // 5000 - 0 => owes the full amount
    })
  })

  it('returns negative solde when no dues exist (credit)', async () => {
    // No dues (sum returns null) but payments exist
    dbCallResults = [
      [{ total: null }],
      [{ total: '1500' }],
    ]

    const result = await PaiementModel.getSoldeCoproprietaire(1)

    expect(result).toEqual({
      total_du: 0,
      total_paye: 1500,
      solde: -1500, // 0 - 1500 => credit balance
    })
  })

  it('handles null sums gracefully (parseFloat(null) edge case)', async () => {
    // Both sums return null — no data at all
    dbCallResults = [
      [{ total: null }],
      [{ total: null }],
    ]

    const result = await PaiementModel.getSoldeCoproprietaire(1)

    // parseFloat(null || 0) => parseFloat(0) => 0
    expect(result).toEqual({
      total_du: 0,
      total_paye: 0,
      solde: 0,
    })

    // Verify we don't get NaN
    expect(Number.isNaN(result.total_du)).toBe(false)
    expect(Number.isNaN(result.total_paye)).toBe(false)
    expect(Number.isNaN(result.solde)).toBe(false)
  })
})
