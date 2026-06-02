import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Verifies that AppelFondsService.generateFromBudget distributes the
 * quarter amount across lots so that the per-lot lines always sum back
 * to exactly the quarter amount, with no centime leak from rounding.
 */

vi.mock('../../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

vi.mock('../../src/models/AppelFonds.js', () => ({
  AppelFondsModel: {},
}))

// Records every montant inserted into appels_fonds_lignes.
let insertedLigneMontants = []
let budget
let lots

function lotsChain() {
  return {
    where: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    then(resolve) {
      return Promise.resolve(resolve(lots))
    },
  }
}

function budgetChain() {
  return {
    where: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(budget),
  }
}

function trxFactory() {
  return tableName => {
    if (tableName === 'appels_fonds') {
      return {
        where: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(undefined), // no existing appel
        insert: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      }
    }
    // appels_fonds_lignes
    return {
      insert: vi.fn(row => {
        insertedLigneMontants.push(row.montant)
        return Promise.resolve([{}])
      }),
    }
  }
}

const mockKnex = vi.fn(tableName => {
  if (tableName === 'budgets_previsionnels') return budgetChain()
  if (tableName === 'lots') return lotsChain()
  return budgetChain()
})
mockKnex.transaction = vi.fn(async callback => callback(trxFactory()))

vi.mock('../../src/config/knex-database.js', () => ({
  default: { getKnex: () => mockKnex },
}))

const { appelFondsService } = await import(
  '../../src/services/AppelFondsService.js'
)

beforeEach(() => {
  vi.clearAllMocks()
  insertedLigneMontants = []
})

describe('AppelFondsService.generateFromBudget — rounding', () => {
  it('lines sum exactly to the quarter amount when tantiemes do not divide evenly', async () => {
    // montant_total = 10000 => quarterAmount = 2500
    // 3 equal lots => 2500/3 = 833.333... which rounds to 833.33 each
    // (sum 2499.99) — the last lot must absorb the 0.01 remainder.
    budget = {
      id: 1,
      copropriete_id: 10,
      annee: 2025,
      montant_total: 10000,
    }
    lots = [
      { id: 1, coproprietaire_id: 100, tantiemes: 1 },
      { id: 2, coproprietaire_id: 101, tantiemes: 1 },
      { id: 3, coproprietaire_id: 102, tantiemes: 1 },
    ]

    await appelFondsService.generateFromBudget(1)

    const quarterAmount = 2500
    // 4 trimesters x 3 lots = 12 lines
    expect(insertedLigneMontants).toHaveLength(12)

    // Each trimester's three lines must sum to exactly 2500.00.
    for (let t = 0; t < 4; t++) {
      const slice = insertedLigneMontants.slice(t * 3, t * 3 + 3)
      const sum = slice.reduce((a, b) => a + b, 0)
      expect(Math.round(sum * 100) / 100).toBe(quarterAmount)
    }

    // First two lots get the rounded share, the last absorbs the remainder.
    expect(insertedLigneMontants[0]).toBe(833.33)
    expect(insertedLigneMontants[1]).toBe(833.33)
    expect(insertedLigneMontants[2]).toBe(833.34)
  })
})
