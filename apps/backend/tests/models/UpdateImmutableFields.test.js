import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests verifying that update() methods on financial models strip
 * immutable owner ids (copropriete_id, coproprietaire_id, budget_id,
 * appel_fonds_id, lot_id) from the payload. Without this guard, a PUT
 * caller could re-parent a lot, budget, appel de fonds or relance into a
 * different copropriété or against a different debtor.
 */

let lastUpdateData = null

function makeChain(resolvedValue) {
  const isArray = Array.isArray(resolvedValue)
  return {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn(data => {
      lastUpdateData = data
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
    leftJoin: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    then(resolve) {
      return Promise.resolve(
        resolve(isArray ? resolvedValue : [resolvedValue])
      )
    },
  }
}

const mockKnex = vi.fn(() => makeChain({ id: 1 }))
mockKnex.fn = { now: vi.fn().mockReturnValue('NOW()') }
mockKnex.raw = vi.fn().mockResolvedValue({ rows: [] })
mockKnex.transaction = vi.fn(async callback => callback(mockKnex))

vi.mock('../../src/config/knex-database.js', () => ({
  default: {
    getKnex: () => mockKnex,
  },
}))

const { LotModel } = await import('../../src/models/Lot.js')
const { BudgetModel } = await import('../../src/models/Budget.js')
const { AppelFondsModel } = await import('../../src/models/AppelFonds.js')
const { RelanceModel } = await import('../../src/models/Relance.js')

beforeEach(() => {
  vi.clearAllMocks()
  lastUpdateData = null
})

describe('LotModel.update', () => {
  it('strips copropriete_id from payload (immutable)', async () => {
    await LotModel.update(1, {
      copropriete_id: 999, // attacker tries to move the lot
      numero: 'A1',
      tantiemes: 100,
    })

    expect(lastUpdateData).toBeDefined()
    expect(lastUpdateData.copropriete_id).toBeUndefined()
    expect(lastUpdateData.numero).toBe('A1')
    expect(lastUpdateData.tantiemes).toBe(100)
  })

  it('keeps allowed fields', async () => {
    await LotModel.update(1, {
      coproprietaire_id: 42,
      surface: 75,
      etage: 3,
      type: 'appartement',
      description: 'T3',
    })

    expect(lastUpdateData.coproprietaire_id).toBe(42)
    expect(lastUpdateData.surface).toBe(75)
    expect(lastUpdateData.etage).toBe(3)
    expect(lastUpdateData.type).toBe('appartement')
    expect(lastUpdateData.description).toBe('T3')
  })
})

describe('BudgetModel.update', () => {
  it('strips copropriete_id from payload (immutable)', async () => {
    await BudgetModel.update(1, {
      copropriete_id: 999,
      annee: 2026,
      montant_total: 50000,
    })

    expect(lastUpdateData.copropriete_id).toBeUndefined()
    expect(lastUpdateData.annee).toBe(2026)
    expect(lastUpdateData.montant_total).toBe(50000)
  })
})

describe('BudgetModel.updatePoste', () => {
  it('strips budget_id from payload (immutable)', async () => {
    await BudgetModel.updatePoste(1, {
      budget_id: 999,
      nom: 'Entretien',
      montant_prevu: 1000,
    })

    expect(lastUpdateData.budget_id).toBeUndefined()
    expect(lastUpdateData.nom).toBe('Entretien')
    expect(lastUpdateData.montant_prevu).toBe(1000)
  })
})

describe('AppelFondsModel.update', () => {
  it('strips copropriete_id and budget_id from payload (immutable)', async () => {
    await AppelFondsModel.update(1, {
      copropriete_id: 999,
      budget_id: 888,
      trimestre: 2,
      montant_total: 12500,
      statut: 'emis',
    })

    expect(lastUpdateData.copropriete_id).toBeUndefined()
    expect(lastUpdateData.budget_id).toBeUndefined()
    expect(lastUpdateData.trimestre).toBe(2)
    expect(lastUpdateData.montant_total).toBe(12500)
    expect(lastUpdateData.statut).toBe('emis')
  })
})

describe('AppelFondsModel.updateLigne', () => {
  it('strips appel_fonds_id and lot_id from payload (immutable)', async () => {
    await AppelFondsModel.updateLigne(1, {
      appel_fonds_id: 999,
      lot_id: 888,
      coproprietaire_id: 42,
      montant: 250.5,
    })

    expect(lastUpdateData.appel_fonds_id).toBeUndefined()
    expect(lastUpdateData.lot_id).toBeUndefined()
    expect(lastUpdateData.coproprietaire_id).toBe(42)
    expect(lastUpdateData.montant).toBe(250.5)
  })
})

describe('RelanceModel.update', () => {
  it('strips copropriete_id and coproprietaire_id from payload (immutable)', async () => {
    await RelanceModel.update(1, {
      copropriete_id: 999,
      coproprietaire_id: 888,
      type: 'mise_en_demeure',
      montant_du: 3500,
      statut: 'envoyee',
    })

    expect(lastUpdateData.copropriete_id).toBeUndefined()
    expect(lastUpdateData.coproprietaire_id).toBeUndefined()
    expect(lastUpdateData.type).toBe('mise_en_demeure')
    expect(lastUpdateData.montant_du).toBe(3500)
    expect(lastUpdateData.statut).toBe('envoyee')
  })
})
