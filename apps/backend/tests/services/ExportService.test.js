import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock logger
vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

// Build a chainable Knex query mock
function createQueryBuilder(data) {
  const builder = {
    _data: data,
    where: vi.fn().mockReturnThis(),
    whereIn: vi.fn().mockReturnThis(),
    whereNotNull: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    join: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    sum: vi.fn().mockReturnThis(),
    max: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(data),
    then: function (resolve) {
      return resolve(Array.isArray(data) ? data : [data])
    },
  }
  // Make the builder thenable so `await db('table')...` resolves
  builder[Symbol.for('nodejs.util.inspect.custom')] = () => 'QueryBuilder'
  return builder
}

// Table-specific data store
let tableData = {}

function mockDb(tableName) {
  const data = tableData[tableName] || []
  return createQueryBuilder(data)
}

vi.mock('../../src/config/knex-database.js', () => ({
  default: {
    getKnex: () => mockDb,
  },
}))

// Mock PDF service
const mockGenerateBudgetPdf = vi.fn().mockReturnValue('pdf-doc')
const mockGenerateAppelFondsPdf = vi.fn().mockReturnValue('pdf-doc')
const mockGenerateFeuillePresencePdf = vi.fn().mockReturnValue('pdf-doc')
const mockGenerateCarnetEntretienPdf = vi.fn().mockReturnValue('pdf-doc')
const mockGenerateEtatImpayesPdf = vi.fn().mockReturnValue('pdf-doc')

vi.mock('../../src/services/ExportPdfService.js', () => ({
  exportPdfService: {
    generateBudgetPdf: (...args) => mockGenerateBudgetPdf(...args),
    generateAppelFondsPdf: (...args) => mockGenerateAppelFondsPdf(...args),
    generateFeuillePresencePdf: (...args) => mockGenerateFeuillePresencePdf(...args),
    generateCarnetEntretienPdf: (...args) => mockGenerateCarnetEntretienPdf(...args),
    generateEtatImpayesPdf: (...args) => mockGenerateEtatImpayesPdf(...args),
  },
}))

// Mock Excel service
const mockGenerateCoproprietairesExcel = vi.fn().mockResolvedValue(Buffer.from('excel'))
const mockGenerateBalanceComptesExcel = vi.fn().mockResolvedValue(Buffer.from('excel'))
const mockGenerateEtatChargesExcel = vi.fn().mockResolvedValue(Buffer.from('excel'))
const mockGenerateEtatImpayesExcel = vi.fn().mockResolvedValue(Buffer.from('excel'))

vi.mock('../../src/services/ExportExcelService.js', () => ({
  exportExcelService: {
    generateCoproprietairesExcel: (...args) => mockGenerateCoproprietairesExcel(...args),
    generateBalanceComptesExcel: (...args) => mockGenerateBalanceComptesExcel(...args),
    generateEtatChargesExcel: (...args) => mockGenerateEtatChargesExcel(...args),
    generateEtatImpayesExcel: (...args) => mockGenerateEtatImpayesExcel(...args),
  },
}))

const { exportService } = await import('../../src/services/ExportService.js')

beforeEach(() => {
  vi.clearAllMocks()
  tableData = {}
})

// ─── _calculateImpayes (the core business logic) ──────────────────────

describe('ExportService._calculateImpayes', () => {
  it('calculates unpaid amounts per coproprietaire', async () => {
    // We test the internal logic by calling the method directly
    const mockDbFn = vi.fn()

    // Chain for totalsDus query
    const totalsDusChain = {
      select: vi.fn().mockReturnThis(),
      sum: vi.fn().mockReturnThis(),
      join: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereNotNull: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      then: (resolve) => resolve([
        { coproprietaire_id: 1, total_du: '1000.00' },
        { coproprietaire_id: 2, total_du: '500.00' },
      ]),
    }

    // Chain for totalsPayes query
    const totalsPayesChain = {
      select: vi.fn().mockReturnThis(),
      sum: vi.fn().mockReturnThis(),
      max: vi.fn().mockReturnThis(),
      join: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      then: (resolve) => resolve([
        { coproprietaire_id: 1, total_paye: '800.00', date_dernier_paiement: '2025-03-01' },
      ]),
    }

    // Chain for coproprietaires names query
    const namesChain = {
      whereIn: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      then: (resolve) => resolve([
        { id: 1, nom: 'Dupont', prenom: 'Jean' },
        { id: 2, nom: 'Martin', prenom: 'Marie' },
      ]),
    }

    let callCount = 0
    mockDbFn.mockImplementation((table) => {
      if (table === 'appels_fonds_lignes') return totalsDusChain
      if (table === 'paiements') return totalsPayesChain
      if (table === 'coproprietaires') return namesChain
      return createQueryBuilder([])
    })

    const result = await exportService._calculateImpayes(mockDbFn, 1)

    expect(result).toHaveLength(2)

    // Results should be sorted by nom
    expect(result[0].nom).toBe('Dupont')
    expect(result[0].montant_du).toBe(1000)
    expect(result[0].montant_paye).toBe(800)
    expect(result[0].solde).toBe(200)
    expect(result[0].date_dernier_paiement).toBe('2025-03-01')

    expect(result[1].nom).toBe('Martin')
    expect(result[1].montant_du).toBe(500)
    expect(result[1].montant_paye).toBe(0) // No payment recorded
    expect(result[1].solde).toBe(500)
    expect(result[1].date_dernier_paiement).toBeNull()
  })

  it('returns empty array when no dues exist', async () => {
    const mockDbFn = vi.fn()

    const emptyChain = {
      select: vi.fn().mockReturnThis(),
      sum: vi.fn().mockReturnThis(),
      max: vi.fn().mockReturnThis(),
      join: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      whereNotNull: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      then: (resolve) => resolve([]),
    }

    mockDbFn.mockReturnValue(emptyChain)

    const result = await exportService._calculateImpayes(mockDbFn, 1)

    expect(result).toEqual([])
  })
})
