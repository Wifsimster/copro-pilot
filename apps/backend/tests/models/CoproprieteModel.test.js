import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests for the Copropriete model.
 * These mock the Knex query builder to verify that the model
 * constructs the correct queries and transforms results properly.
 */

// Build a chainable mock for Knex
function createChain(resolvedValue) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    del: vi.fn().mockResolvedValue(1),
    returning: vi.fn().mockResolvedValue(Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue]),
    first: vi.fn().mockResolvedValue(resolvedValue),
    count: vi.fn().mockReturnThis(),
    sum: vi.fn().mockReturnThis(),
    countDistinct: vi.fn().mockReturnThis(),
    then: function (resolve) {
      return Promise.resolve(resolve(Array.isArray(resolvedValue) ? resolvedValue : [resolvedValue]))
    },
  }
  return chain
}

let mockChain
const mockKnex = vi.fn(() => mockChain)
mockKnex.fn = { now: vi.fn().mockReturnValue('NOW()') }

vi.mock('../../src/config/knex-database.js', () => ({
  default: {
    getKnex: () => mockKnex,
  },
}))

const { CoproprieteModel } = await import('../../src/models/Copropriete.js')

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getAll ────────────────────────────────────────────────────────────

describe('CoproprieteModel.getAll', () => {
  it('queries all coproprietes ordered by name', async () => {
    const data = [{ id: 1, nom: 'A' }, { id: 2, nom: 'B' }]
    mockChain = createChain(data)

    await CoproprieteModel.getAll()

    expect(mockKnex).toHaveBeenCalledWith('coproprietes')
    expect(mockChain.select).toHaveBeenCalledWith('*')
    expect(mockChain.orderBy).toHaveBeenCalledWith('nom', 'asc')
  })
})

// ─── getById ───────────────────────────────────────────────────────────

describe('CoproprieteModel.getById', () => {
  it('queries by id and returns first result', async () => {
    const data = { id: 1, nom: 'Résidence A' }
    mockChain = createChain(data)

    const result = await CoproprieteModel.getById(1)

    expect(mockKnex).toHaveBeenCalledWith('coproprietes')
    expect(mockChain.where).toHaveBeenCalledWith('id', 1)
    expect(mockChain.first).toHaveBeenCalled()
    expect(result).toEqual(data)
  })

  it('returns undefined when not found', async () => {
    mockChain = createChain(undefined)
    mockChain.first.mockResolvedValue(undefined)

    const result = await CoproprieteModel.getById(999)

    expect(result).toBeUndefined()
  })
})

// ─── create ────────────────────────────────────────────────────────────

describe('CoproprieteModel.create', () => {
  it('inserts with all provided fields', async () => {
    const input = {
      nom: 'New Copro',
      adresse: '1 Rue Test',
      code_postal: '75001',
      ville: 'Paris',
      nombre_lots: 10,
    }
    const created = { id: 3, ...input }
    mockChain = createChain(created)

    const result = await CoproprieteModel.create(input)

    expect(mockKnex).toHaveBeenCalledWith('coproprietes')
    expect(mockChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        nom: 'New Copro',
        adresse: '1 Rue Test',
        code_postal: '75001',
        ville: 'Paris',
        nombre_lots: 10,
      })
    )
    expect(mockChain.returning).toHaveBeenCalledWith('*')
    expect(result).toEqual(created)
  })

  it('defaults optional numeric fields to 0', async () => {
    const input = { nom: 'Test', adresse: 'A', code_postal: '0', ville: 'V' }
    mockChain = createChain({ id: 1, ...input })

    await CoproprieteModel.create(input)

    const insertArg = mockChain.insert.mock.calls[0][0]
    expect(insertArg.nombre_lots).toBe(0)
    expect(insertArg.nombre_batiments).toBe(0)
    expect(insertArg.nombre_ascenseurs).toBe(0)
  })
})

// ─── update ────────────────────────────────────────────────────────────

describe('CoproprieteModel.update', () => {
  it('updates and sets updated_at', async () => {
    mockChain = createChain({ id: 1, nom: 'Updated' })

    await CoproprieteModel.update(1, { nom: 'Updated' })

    expect(mockChain.where).toHaveBeenCalledWith('id', 1)
    expect(mockChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        nom: 'Updated',
        updated_at: expect.anything(),
      })
    )
    expect(mockChain.returning).toHaveBeenCalledWith('*')
  })
})

// ─── delete ────────────────────────────────────────────────────────────

describe('CoproprieteModel.delete', () => {
  it('deletes by id', async () => {
    mockChain = createChain(undefined)

    await CoproprieteModel.delete(1)

    expect(mockKnex).toHaveBeenCalledWith('coproprietes')
    expect(mockChain.where).toHaveBeenCalledWith('id', 1)
    expect(mockChain.del).toHaveBeenCalled()
  })
})

// ─── getStats ──────────────────────────────────────────────────────────

describe('CoproprieteModel.getStats', () => {
  it('returns parsed statistics for a copropriete', async () => {
    let callCount = 0
    mockKnex.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // lots count query
        return {
          where: vi.fn().mockReturnThis(),
          count: vi.fn().mockReturnThis(),
          first: vi.fn().mockResolvedValue({ count: '10' }),
        }
      }
      if (callCount === 2) {
        // tantiemes sum query
        return {
          where: vi.fn().mockReturnThis(),
          sum: vi.fn().mockReturnThis(),
          first: vi.fn().mockResolvedValue({ total: '5000' }),
        }
      }
      if (callCount === 3) {
        // coproprietaires count query
        return {
          where: vi.fn().mockReturnThis(),
          whereNotNull: vi.fn().mockReturnThis(),
          countDistinct: vi.fn().mockReturnThis(),
          first: vi.fn().mockResolvedValue({ count: '7' }),
        }
      }
    })

    const result = await CoproprieteModel.getStats(1)

    expect(result).toEqual({
      nombre_lots: 10,
      total_tantiemes: 5000,
      nombre_coproprietaires: 7,
    })
  })

  it('returns zeros when no data exists', async () => {
    let callCount = 0
    mockKnex.mockImplementation(() => {
      callCount++
      return {
        where: vi.fn().mockReturnThis(),
        whereNotNull: vi.fn().mockReturnThis(),
        count: vi.fn().mockReturnThis(),
        sum: vi.fn().mockReturnThis(),
        countDistinct: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(
          callCount === 1 ? { count: '0' } :
          callCount === 2 ? { total: null } :
          { count: '0' }
        ),
      }
    })

    const result = await CoproprieteModel.getStats(999)

    expect(result).toEqual({
      nombre_lots: 0,
      total_tantiemes: 0,
      nombre_coproprietaires: 0,
    })
  })
})
