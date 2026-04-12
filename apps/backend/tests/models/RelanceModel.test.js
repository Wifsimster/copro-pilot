import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests for RelanceModel.create.
 * Verifies default statut is 'brouillon' and explicit statut is respected.
 */

let lastInsertData = null

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
      lastInsertData = data
      return {
        returning: vi.fn().mockResolvedValue(
          isArray ? resolvedValue : [resolvedValue]
        ),
      }
    }),
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
}

const mockKnex = vi.fn()
mockKnex.fn = { now: vi.fn().mockReturnValue('NOW()') }
mockKnex.raw = vi.fn().mockResolvedValue({ rows: [] })
mockKnex.transaction = vi.fn(async callback => callback(mockKnex))

vi.mock('../../src/config/knex-database.js', () => ({
  default: {
    getKnex: () => mockKnex,
  },
}))

const { RelanceModel } = await import('../../src/models/Relance.js')

beforeEach(() => {
  vi.clearAllMocks()
  lastInsertData = null
})

// ─── create ──────────────────────────────────────────────────────────

describe('RelanceModel.create', () => {
  it('defaults statut to brouillon (not en_attente)', async () => {
    const created = {
      id: 1,
      copropriete_id: 10,
      coproprietaire_id: 5,
      type: null,
      date_relance: '2025-06-15',
      montant_du: 1500,
      mode_envoi: null,
      statut: 'brouillon',
      notes: null,
    }

    mockKnex.mockReturnValue(makeChain(created))

    const result = await RelanceModel.create({
      copropriete_id: 10,
      coproprietaire_id: 5,
      date_relance: '2025-06-15',
      montant_du: 1500,
    })

    expect(lastInsertData).toBeDefined()
    expect(lastInsertData.statut).toBe('brouillon')
    expect(lastInsertData.statut).not.toBe('en_attente')
    expect(result).toEqual(created)
  })

  it('respects explicit statut when provided', async () => {
    const created = {
      id: 2,
      copropriete_id: 10,
      coproprietaire_id: 5,
      type: 'mise_en_demeure',
      date_relance: '2025-07-01',
      montant_du: 2000,
      mode_envoi: 'courrier',
      statut: 'envoyee',
      notes: 'Relance urgente',
    }

    mockKnex.mockReturnValue(makeChain(created))

    const result = await RelanceModel.create({
      copropriete_id: 10,
      coproprietaire_id: 5,
      type: 'mise_en_demeure',
      date_relance: '2025-07-01',
      montant_du: 2000,
      mode_envoi: 'courrier',
      statut: 'envoyee',
      notes: 'Relance urgente',
    })

    expect(lastInsertData.statut).toBe('envoyee')
    expect(result.statut).toBe('envoyee')
  })

  it('sets optional fields to null when not provided', async () => {
    const created = {
      id: 3,
      copropriete_id: 10,
      coproprietaire_id: 5,
      type: null,
      date_relance: '2025-08-01',
      montant_du: 3000,
      mode_envoi: null,
      statut: 'brouillon',
      notes: null,
    }

    mockKnex.mockReturnValue(makeChain(created))

    await RelanceModel.create({
      copropriete_id: 10,
      coproprietaire_id: 5,
      date_relance: '2025-08-01',
      montant_du: 3000,
    })

    expect(lastInsertData.type).toBeNull()
    expect(lastInsertData.mode_envoi).toBeNull()
    expect(lastInsertData.notes).toBeNull()
  })
})
