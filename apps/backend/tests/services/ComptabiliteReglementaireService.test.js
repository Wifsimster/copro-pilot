import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests for ComptabiliteReglementaireService.genererEcrituresExercice.
 * Verifies transaction usage, closed exercice rejection, and not-found error.
 */

// Mock logger
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Mock the model for getExerciceById
const mockGetExerciceById = vi.fn()

vi.mock('../../src/models/ComptabiliteReglementaire.js', () => ({
  ComptabiliteReglementaireModel: {
    getExercicesByCopropriete: vi.fn(),
    getExerciceById: (...args) => mockGetExerciceById(...args),
    createExercice: vi.fn(),
    updateExercice: vi.fn(),
    clotureExercice: vi.fn(),
    getPlanComptable: vi.fn(),
    getCompte: vi.fn(),
    createCompte: vi.fn(),
    updateCompte: vi.fn(),
    getEcrituresByExercice: vi.fn(),
    getEcrituresByCompte: vi.fn(),
    createEcriture: vi.fn(),
    deleteEcriture: vi.fn(),
    deleteEcrituresByExercice: vi.fn(),
    getJournal: vi.fn(),
    getGrandLivre: vi.fn(),
    getBalance: vi.fn(),
    getAnnexe1Data: vi.fn(),
    getAnnexe2Data: vi.fn(),
    getAnnexe3Data: vi.fn(),
    getAnnexe4Data: vi.fn(),
    getAnnexe5Data: vi.fn(),
  },
}))

// ─── Knex mock for genererEcrituresExercice ──────────────────────────
// genererEcrituresExercice uses dynamic import of knex-database.js
// and runs: db('appels_fonds_lignes').join(...), db('paiements').join(...),
// db('mouvements_bancaires').join(...), then db.transaction(...)

let dbCallIndex = 0
let dbCallResults = []
let transactionCallback = null
let transactionDelCalled = false
let transactionInsertData = null
let transactionInsertResult = []

function makeChain(resolvedValue) {
  const isArray = Array.isArray(resolvedValue)
  return {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    whereNull: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    insert: vi.fn(data => {
      transactionInsertData = data
      return {
        returning: vi.fn().mockResolvedValue(transactionInsertResult),
      }
    }),
    update: vi.fn().mockReturnThis(),
    del: vi.fn((...args) => {
      transactionDelCalled = true
      return Promise.resolve(1)
    }),
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

const mockKnex = vi.fn(() => {
  const result = dbCallResults[dbCallIndex] ?? []
  dbCallIndex++
  return makeChain(result)
})

mockKnex.fn = { now: vi.fn().mockReturnValue('NOW()') }
mockKnex.raw = vi.fn().mockResolvedValue({ rows: [] })

mockKnex.transaction = vi.fn(async callback => {
  transactionCallback = callback
  // The trx inside the transaction uses the same pattern
  const trx = vi.fn(tableName => {
    // For the delete: trx('ecritures_comptables').where(...).del()
    // For the insert: trx('ecritures_comptables').insert(...).returning('*')
    const chain = makeChain([])
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

const { comptabiliteReglementaireService } = await import(
  '../../src/services/ComptabiliteReglementaireService.js'
)

beforeEach(() => {
  vi.clearAllMocks()
  dbCallIndex = 0
  dbCallResults = []
  transactionCallback = null
  transactionDelCalled = false
  transactionInsertData = null
  transactionInsertResult = []
})

// ─── genererEcrituresExercice ────────────────────────────────────────

describe('ComptabiliteReglementaireService.genererEcrituresExercice', () => {
  it('wraps delete + insert in a transaction', async () => {
    const exercice = {
      id: 1,
      copropriete_id: 10,
      annee: 2025,
      date_debut: '2025-01-01',
      date_fin: '2025-12-31',
      statut: 'ouvert',
    }
    mockGetExerciceById.mockResolvedValue(exercice)

    // db queries for lignesAppels, paiements, mouvements => all empty
    dbCallResults = [
      [], // appels_fonds_lignes join
      [], // paiements join
      [], // mouvements_bancaires join
    ]

    await comptabiliteReglementaireService.genererEcrituresExercice(1)

    // Transaction was called
    expect(mockKnex.transaction).toHaveBeenCalledTimes(1)
    expect(mockKnex.transaction).toHaveBeenCalledWith(expect.any(Function))

    // The delete should have been attempted inside the transaction
    // (trx('ecritures_comptables').where('exercice_id', ...).del())
    expect(transactionDelCalled).toBe(true)
  })

  it('throws for closed exercice', async () => {
    const exercice = {
      id: 1,
      copropriete_id: 10,
      annee: 2025,
      date_debut: '2025-01-01',
      date_fin: '2025-12-31',
      statut: 'cloture',
    }
    mockGetExerciceById.mockResolvedValue(exercice)

    await expect(
      comptabiliteReglementaireService.genererEcrituresExercice(1)
    ).rejects.toThrow(
      'Impossible de générer des écritures sur un exercice clôturé'
    )

    // Transaction should NOT have been called
    expect(mockKnex.transaction).not.toHaveBeenCalled()
  })

  it('throws for non-existent exercice', async () => {
    mockGetExerciceById.mockResolvedValue(null)

    await expect(
      comptabiliteReglementaireService.genererEcrituresExercice(999)
    ).rejects.toThrow('Exercice non trouvé')

    // No DB queries should have been made
    expect(mockKnex.transaction).not.toHaveBeenCalled()
  })

  it('generates debit/credit pairs from appels_fonds_lignes', async () => {
    const exercice = {
      id: 1,
      copropriete_id: 10,
      annee: 2025,
      date_debut: '2025-01-01',
      date_fin: '2025-12-31',
      statut: 'ouvert',
    }
    mockGetExerciceById.mockResolvedValue(exercice)

    const lignesAppels = [
      {
        id: 100,
        appel_fonds_id: 1,
        coproprietaire_id: 50,
        montant: 500,
        trimestre: 1,
        date_emission: '2025-01-01',
        copro_nom: 'Dupont',
        copro_prenom: 'Jean',
      },
    ]

    // First query: appels_fonds_lignes => lignesAppels
    // Second query: paiements => empty
    // Third query: mouvements => empty
    dbCallResults = [lignesAppels, [], []]

    // Track what gets inserted in the transaction
    const insertedEcritures = []
    mockKnex.transaction.mockImplementation(async callback => {
      const trx = vi.fn(() => {
        const chain = makeChain([])
        chain.insert = vi.fn(data => {
          insertedEcritures.push(...(Array.isArray(data) ? data : [data]))
          return {
            returning: vi.fn().mockResolvedValue(
              Array.isArray(data) ? data : [data]
            ),
          }
        })
        return chain
      })
      trx.fn = mockKnex.fn
      trx.raw = mockKnex.raw
      return callback(trx)
    })

    await comptabiliteReglementaireService.genererEcrituresExercice(1)

    // Should have 2 ecritures: debit 450, credit 701
    expect(insertedEcritures.length).toBe(2)

    const debitEcriture = insertedEcritures.find(
      e => e.compte_code === '450' && e.debit === 500
    )
    const creditEcriture = insertedEcritures.find(
      e => e.compte_code === '701' && e.credit === 500
    )

    expect(debitEcriture).toBeDefined()
    expect(creditEcriture).toBeDefined()
    expect(debitEcriture.coproprietaire_id).toBe(50)
    expect(creditEcriture.coproprietaire_id).toBe(50)
  })
})
