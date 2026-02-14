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

// Mock the model
const mockGetAll = vi.fn()
const mockGetById = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockGetStats = vi.fn()

vi.mock('../../src/models/Copropriete.js', () => ({
  CoproprieteModel: {
    getAll: (...args) => mockGetAll(...args),
    getById: (...args) => mockGetById(...args),
    create: (...args) => mockCreate(...args),
    update: (...args) => mockUpdate(...args),
    delete: (...args) => mockDelete(...args),
    getStats: (...args) => mockGetStats(...args),
  },
}))

const { coproprieteService } = await import('../../src/services/CoproprieteService.js')

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── getAll ────────────────────────────────────────────────────────────

describe('CoproprieteService.getAll', () => {
  it('returns coproprietes enriched with stats', async () => {
    mockGetAll.mockResolvedValue([
      { id: 1, nom: 'Résidence A' },
      { id: 2, nom: 'Résidence B' },
    ])
    mockGetStats.mockImplementation(async (id) => ({
      nb_lots: id === 1 ? 10 : 5,
      total_tantiemes: id === 1 ? 1000 : 500,
      nb_coproprietaires: id === 1 ? 8 : 3,
    }))

    const result = await coproprieteService.getAll()

    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      id: 1,
      nom: 'Résidence A',
      nb_lots: 10,
      total_tantiemes: 1000,
      nb_coproprietaires: 8,
    })
    expect(result[1].nb_lots).toBe(5)
    expect(mockGetStats).toHaveBeenCalledTimes(2)
  })

  it('returns empty array when no coproprietes exist', async () => {
    mockGetAll.mockResolvedValue([])

    const result = await coproprieteService.getAll()

    expect(result).toEqual([])
    expect(mockGetStats).not.toHaveBeenCalled()
  })

  it('propagates model errors', async () => {
    mockGetAll.mockRejectedValue(new Error('DB error'))

    await expect(coproprieteService.getAll()).rejects.toThrow('DB error')
  })
})

// ─── getById ───────────────────────────────────────────────────────────

describe('CoproprieteService.getById', () => {
  it('returns copropriete enriched with stats', async () => {
    mockGetById.mockResolvedValue({ id: 1, nom: 'Résidence A' })
    mockGetStats.mockResolvedValue({ nb_lots: 10, total_tantiemes: 1000, nb_coproprietaires: 8 })

    const result = await coproprieteService.getById(1)

    expect(result).toEqual({
      id: 1,
      nom: 'Résidence A',
      nb_lots: 10,
      total_tantiemes: 1000,
      nb_coproprietaires: 8,
    })
  })

  it('returns null when copropriete not found', async () => {
    mockGetById.mockResolvedValue(null)

    const result = await coproprieteService.getById(999)

    expect(result).toBeNull()
    expect(mockGetStats).not.toHaveBeenCalled()
  })

  it('propagates model errors', async () => {
    mockGetById.mockRejectedValue(new Error('Connection lost'))

    await expect(coproprieteService.getById(1)).rejects.toThrow('Connection lost')
  })
})

// ─── create ────────────────────────────────────────────────────────────

describe('CoproprieteService.create', () => {
  it('creates and returns the new copropriete', async () => {
    const input = { nom: 'New Copro', adresse: '1 Rue Test' }
    mockCreate.mockResolvedValue({ id: 3, ...input })

    const result = await coproprieteService.create(input)

    expect(result).toEqual({ id: 3, ...input })
    expect(mockCreate).toHaveBeenCalledWith(input)
  })

  it('propagates validation errors from model', async () => {
    mockCreate.mockRejectedValue(new Error('nom is required'))

    await expect(coproprieteService.create({})).rejects.toThrow('nom is required')
  })
})

// ─── update ────────────────────────────────────────────────────────────

describe('CoproprieteService.update', () => {
  it('updates and returns the modified copropriete', async () => {
    mockGetById.mockResolvedValue({ id: 1, nom: 'Old' })
    mockUpdate.mockResolvedValue({ id: 1, nom: 'Updated' })

    const result = await coproprieteService.update(1, { nom: 'Updated' })

    expect(result).toEqual({ id: 1, nom: 'Updated' })
    expect(mockUpdate).toHaveBeenCalledWith(1, { nom: 'Updated' })
  })

  it('returns null when copropriete does not exist', async () => {
    mockGetById.mockResolvedValue(null)

    const result = await coproprieteService.update(999, { nom: 'X' })

    expect(result).toBeNull()
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

// ─── delete ────────────────────────────────────────────────────────────

describe('CoproprieteService.delete', () => {
  it('returns true after successful deletion', async () => {
    mockGetById.mockResolvedValue({ id: 1, nom: 'ToDelete' })
    mockDelete.mockResolvedValue(undefined)

    const result = await coproprieteService.delete(1)

    expect(result).toBe(true)
    expect(mockDelete).toHaveBeenCalledWith(1)
  })

  it('returns false when copropriete does not exist', async () => {
    mockGetById.mockResolvedValue(null)

    const result = await coproprieteService.delete(999)

    expect(result).toBe(false)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('propagates model errors', async () => {
    mockGetById.mockResolvedValue({ id: 1, nom: 'Test' })
    mockDelete.mockRejectedValue(new Error('FK constraint'))

    await expect(coproprieteService.delete(1)).rejects.toThrow('FK constraint')
  })
})
