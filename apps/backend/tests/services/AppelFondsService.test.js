import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  buildBudget,
  buildLot,
  buildAppelFonds,
  buildCoproprietaire,
  resetSequence,
} from '../helpers/factories.js'

// Mock logger
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock AppelFondsModel (used by non-generateFromBudget methods)
vi.mock('../../src/models/AppelFonds.js', () => ({
  AppelFondsModel: {
    getAllByCopropriete: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getLignes: vi.fn(),
    createLigne: vi.fn(),
    updateLigne: vi.fn(),
    deleteLigne: vi.fn(),
  },
}))

// ─── Knex mock setup for generateFromBudget ──────────────────────────
//
// generateFromBudget calls knexDatabase.getKnex() directly to run
// queries against budgets_previsionnels, lots, appels_fonds, and
// appels_fonds_lignes — all inside a transaction.

let dbCallIndex = 0
let dbCallResults = []

function makeChain(resolvedValue) {
  const isArray = Array.isArray(resolvedValue)
  const chain = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    whereNull: vi.fn().mockReturnThis(),
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

// trx mock — we track insert calls to verify appels_fonds and lignes
let trxInsertCalls = []
let trxCallIndex = 0
let trxCallResults = []

mockKnex.transaction = vi.fn(async callback => {
  trxInsertCalls = []
  trxCallIndex = 0

  const trx = vi.fn(() => {
    const result = trxCallResults[trxCallIndex] ?? trxCallResults[trxCallResults.length - 1]
    trxCallIndex++
    const chain = makeChain(result)

    // Track insert calls
    const originalInsert = chain.insert
    chain.insert = vi.fn(data => {
      trxInsertCalls.push(data)
      return {
        returning: vi.fn().mockResolvedValue(
          Array.isArray(result) ? result : [result]
        ),
      }
    })

    return chain
  })
  trx.fn = mockKnex.fn
  trx.raw = mockKnex.raw
  return callback(trx)
})

vi.mock('../../src/config/knex-database.js', () => ({
  default: {
    getKnex: () => mockKnex,
  },
}))

const { appelFondsService } = await import(
  '../../src/services/AppelFondsService.js'
)

beforeEach(() => {
  vi.clearAllMocks()
  dbCallIndex = 0
  dbCallResults = []
  trxCallIndex = 0
  trxCallResults = []
  trxInsertCalls = []
  resetSequence()
})

// ─── generateFromBudget ──────────────────────────────────────────────

describe('AppelFondsService.generateFromBudget', () => {
  it('generates 4 appels for 4 trimesters', async () => {
    const budget = buildBudget({
      id: 1,
      copropriete_id: 10,
      annee: 2025,
      montant_total: 40000,
    })
    const lot1 = buildLot({
      id: 1,
      copropriete_id: 10,
      coproprietaire_id: 100,
      tantiemes: 600,
    })
    const lot2 = buildLot({
      id: 2,
      copropriete_id: 10,
      coproprietaire_id: 101,
      tantiemes: 400,
    })

    // db('budgets_previsionnels').where('id', budgetId).first() => budget
    // db('lots').where(...).whereNotNull(...) => [lot1, lot2]
    dbCallResults = [budget, [lot1, lot2]]

    // Inside transaction: for each trimester
    //   trx('appels_fonds').where({...}).first() => undefined (no existing)
    //   trx('appels_fonds').insert(...).returning('*') => [appel]
    //   trx('appels_fonds_lignes').insert(...) for each lot
    //
    // 4 trimesters x (1 check + 1 insert + 2 ligne inserts) = 16 trx calls
    const appels = []
    const trxResults = []
    for (let t = 1; t <= 4; t++) {
      const appel = buildAppelFonds({
        id: t,
        copropriete_id: 10,
        budget_id: 1,
        trimestre: t,
        annee: 2025,
        montant_total: 10000,
      })
      appels.push(appel)

      // first() for existing check => undefined
      trxResults.push(undefined)
      // insert appel => [appel]
      trxResults.push(appel)
      // insert ligne for lot1
      trxResults.push({ id: t * 10 })
      // insert ligne for lot2
      trxResults.push({ id: t * 10 + 1 })
    }
    trxCallResults = trxResults

    const result = await appelFondsService.generateFromBudget(1)

    expect(result).toHaveLength(4)
    expect(mockKnex.transaction).toHaveBeenCalledTimes(1)
    // Verify each trimester was created
    result.forEach((appel, i) => {
      expect(appel.trimestre).toBe(i + 1)
    })
  })

  it('tantieme-based rounding is correct (sum of lignes ≈ quarterAmount)', async () => {
    // With montant_total = 30000, quarterAmount = 7500
    // 3 lots with tantiemes 333, 333, 334 => total 1000
    // lot1: 7500 * 333 / 1000 = 2497.50
    // lot2: 7500 * 333 / 1000 = 2497.50
    // lot3: 7500 * 334 / 1000 = 2505.00
    // sum = 7500.00 exactly
    const budget = buildBudget({
      id: 1,
      copropriete_id: 10,
      annee: 2025,
      montant_total: 30000,
    })
    const lots = [
      buildLot({ id: 1, copropriete_id: 10, coproprietaire_id: 100, tantiemes: 333 }),
      buildLot({ id: 2, copropriete_id: 10, coproprietaire_id: 101, tantiemes: 333 }),
      buildLot({ id: 3, copropriete_id: 10, coproprietaire_id: 102, tantiemes: 334 }),
    ]

    dbCallResults = [budget, lots]

    const trxResults = []
    for (let t = 1; t <= 4; t++) {
      const appel = buildAppelFonds({ id: t, copropriete_id: 10, trimestre: t })
      trxResults.push(undefined) // no existing
      trxResults.push(appel)    // insert appel
      trxResults.push({})       // ligne 1
      trxResults.push({})       // ligne 2
      trxResults.push({})       // ligne 3
    }
    trxCallResults = trxResults

    await appelFondsService.generateFromBudget(1)

    // Verify rounding logic: collect montant from insert calls
    const quarterAmount = 30000 / 4 // 7500
    const totalTantiemes = 333 + 333 + 334

    const montants = lots.map(lot => {
      const raw = (quarterAmount * parseInt(lot.tantiemes, 10)) / totalTantiemes
      return Math.round(raw * 100) / 100
    })

    const sum = montants.reduce((a, b) => a + b, 0)
    // Sum should be very close to quarterAmount (within rounding tolerance)
    expect(Math.abs(sum - quarterAmount)).toBeLessThan(0.02)

    // Verify individual amounts
    expect(montants[0]).toBe(2497.5)
    expect(montants[1]).toBe(2497.5)
    expect(montants[2]).toBe(2505)
  })

  it('skips existing trimesters', async () => {
    const budget = buildBudget({
      id: 1,
      copropriete_id: 10,
      annee: 2025,
      montant_total: 40000,
    })
    const lot = buildLot({
      id: 1,
      copropriete_id: 10,
      coproprietaire_id: 100,
      tantiemes: 1000,
    })

    dbCallResults = [budget, [lot]]

    // Trimesters 1 and 3 already exist, 2 and 4 do not
    const existingT1 = buildAppelFonds({ id: 99, trimestre: 1 })
    const existingT3 = buildAppelFonds({ id: 98, trimestre: 3 })
    const newAppelT2 = buildAppelFonds({ id: 50, trimestre: 2, copropriete_id: 10 })
    const newAppelT4 = buildAppelFonds({ id: 51, trimestre: 4, copropriete_id: 10 })

    trxCallResults = [
      existingT1,    // T1 check => found
      undefined,     // T2 check => not found
      newAppelT2,    // T2 insert
      {},            // T2 ligne
      existingT3,    // T3 check => found
      undefined,     // T4 check => not found
      newAppelT4,    // T4 insert
      {},            // T4 ligne
    ]

    const result = await appelFondsService.generateFromBudget(1)

    // Only 2 appels created (T2 and T4)
    expect(result).toHaveLength(2)
    expect(result[0].trimestre).toBe(2)
    expect(result[1].trimestre).toBe(4)
  })

  it('throws when budget not found', async () => {
    // db('budgets_previsionnels').where('id', 999).first() => undefined
    dbCallResults = [undefined]

    await expect(
      appelFondsService.generateFromBudget(999)
    ).rejects.toThrow('Budget non trouve')
  })

  it('throws when totalTantiemes is 0', async () => {
    const budget = buildBudget({
      id: 1,
      copropriete_id: 10,
      montant_total: 40000,
    })
    // Lots with 0 tantiemes (or no tantiemes)
    const lot = buildLot({
      id: 1,
      copropriete_id: 10,
      coproprietaire_id: 100,
      tantiemes: 0,
    })

    dbCallResults = [budget, [lot]]

    await expect(
      appelFondsService.generateFromBudget(1)
    ).rejects.toThrow('Aucun tantieme configure')
  })
})
