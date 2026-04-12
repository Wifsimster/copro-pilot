import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildMutation, resetSequence } from '../helpers/factories.js'

/**
 * Unit tests for MutationModel.create and update.
 * Verifies that transactions are used and lot ownership is updated.
 */

let trxInsertData = []
let trxUpdateData = []
let trxCallIndex = 0
let trxCallResults = []

function makeChain(resolvedValue) {
  const isArray = Array.isArray(resolvedValue)
  return {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn(data => {
      trxInsertData.push(data)
      return {
        returning: vi.fn().mockResolvedValue(
          isArray ? resolvedValue : [resolvedValue]
        ),
      }
    }),
    update: vi.fn(data => {
      trxUpdateData.push(data)
      return {
        returning: vi.fn().mockResolvedValue(
          isArray ? resolvedValue : [resolvedValue]
        ),
      }
    }),
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
}

const mockKnex = vi.fn()
mockKnex.fn = { now: vi.fn().mockReturnValue('NOW()') }
mockKnex.raw = vi.fn().mockResolvedValue({ rows: [] })

// Track whether transaction was called
let transactionCalled = false

mockKnex.transaction = vi.fn(async callback => {
  transactionCalled = true
  trxCallIndex = 0

  const trx = vi.fn(() => {
    const result = trxCallResults[trxCallIndex] ?? trxCallResults[trxCallResults.length - 1]
    trxCallIndex++
    return makeChain(result)
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

const { MutationModel } = await import('../../src/models/Mutation.js')

beforeEach(() => {
  vi.clearAllMocks()
  trxInsertData = []
  trxUpdateData = []
  trxCallIndex = 0
  trxCallResults = []
  transactionCalled = false
  resetSequence()
})

// ─── create ──────────────────────────────────────────────────────────

describe('MutationModel.create', () => {
  it('uses a transaction', async () => {
    const mutation = buildMutation({
      id: 1,
      lot_id: 5,
      nouveau_proprietaire_id: 42,
    })
    // trx('mutations').insert(...).returning('*') => [mutation]
    // trx('lots').where(...).update(...)
    trxCallResults = [mutation, mutation]

    await MutationModel.create({
      lot_id: 5,
      ancien_proprietaire_id: 10,
      nouveau_proprietaire_id: 42,
      date_mutation: '2025-06-01',
    })

    expect(transactionCalled).toBe(true)
    expect(mockKnex.transaction).toHaveBeenCalledTimes(1)
  })

  it('updates lot owner when nouveau_proprietaire_id is provided', async () => {
    const mutation = buildMutation({
      id: 1,
      lot_id: 5,
      nouveau_proprietaire_id: 42,
    })
    // First trx call: insert mutation
    // Second trx call: update lot owner
    trxCallResults = [mutation, {}]

    await MutationModel.create({
      lot_id: 5,
      ancien_proprietaire_id: 10,
      nouveau_proprietaire_id: 42,
      date_mutation: '2025-06-01',
    })

    // Insert was called with mutation data
    expect(trxInsertData.length).toBeGreaterThanOrEqual(1)
    expect(trxInsertData[0]).toEqual(
      expect.objectContaining({
        lot_id: 5,
        ancien_proprietaire_id: 10,
        nouveau_proprietaire_id: 42,
      })
    )

    // Update was called for the lot
    expect(trxUpdateData.length).toBeGreaterThanOrEqual(1)
    expect(trxUpdateData[0]).toEqual(
      expect.objectContaining({
        coproprietaire_id: 42,
      })
    )
  })

  it('does not update lot when nouveau_proprietaire_id is null', async () => {
    const mutation = buildMutation({
      id: 1,
      lot_id: 5,
      nouveau_proprietaire_id: null,
    })
    trxCallResults = [mutation]

    await MutationModel.create({
      lot_id: 5,
      ancien_proprietaire_id: 10,
      nouveau_proprietaire_id: null,
      date_mutation: '2025-06-01',
    })

    // Only the mutation insert, no lot update
    expect(trxInsertData).toHaveLength(1)
    expect(trxUpdateData).toHaveLength(0)
  })
})

// ─── update ──────────────────────────────────────────────────────────

describe('MutationModel.update', () => {
  it('uses a transaction', async () => {
    const mutation = buildMutation({
      id: 1,
      lot_id: 5,
      nouveau_proprietaire_id: 42,
    })
    trxCallResults = [mutation, {}]

    await MutationModel.update(1, {
      ancien_proprietaire_id: 10,
      nouveau_proprietaire_id: 42,
      date_mutation: '2025-07-01',
      type: 'vente',
    })

    expect(transactionCalled).toBe(true)
    expect(mockKnex.transaction).toHaveBeenCalledTimes(1)
  })

  it('updates lot when nouveau_proprietaire_id is provided and result has lot_id', async () => {
    const mutationResult = buildMutation({
      id: 1,
      lot_id: 5,
      nouveau_proprietaire_id: 42,
    })
    // First trx call: update mutation => [mutationResult]
    // Second trx call: update lot
    trxCallResults = [mutationResult, {}]

    await MutationModel.update(1, {
      ancien_proprietaire_id: 10,
      nouveau_proprietaire_id: 42,
      date_mutation: '2025-07-01',
      type: 'vente',
    })

    // The first update is for the mutation itself
    expect(trxUpdateData.length).toBeGreaterThanOrEqual(1)

    // The second update should be for the lot
    expect(trxUpdateData).toHaveLength(2)
    expect(trxUpdateData[1]).toEqual(
      expect.objectContaining({
        coproprietaire_id: 42,
      })
    )
  })

  it('does not update lot when nouveau_proprietaire_id is null', async () => {
    const mutationResult = buildMutation({
      id: 1,
      lot_id: 5,
      nouveau_proprietaire_id: null,
    })
    trxCallResults = [mutationResult]

    await MutationModel.update(1, {
      ancien_proprietaire_id: 10,
      nouveau_proprietaire_id: null,
      date_mutation: '2025-07-01',
      type: 'donation',
    })

    // Only one update (the mutation itself), no lot update
    expect(trxUpdateData).toHaveLength(1)
  })
})
