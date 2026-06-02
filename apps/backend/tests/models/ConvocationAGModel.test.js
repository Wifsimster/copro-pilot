import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests for ConvocationAGModel.verifierDelai — the legal 21-day
 * convocation delay (art. 9 décret 67-223). The day count must be a
 * stable whole number of calendar days, independent of timezone and of
 * whether the stored date comes back as a string or a Date.
 */

let agRow

const mockKnex = vi.fn(() => ({
  where: vi.fn().mockReturnThis(),
  first: vi.fn().mockResolvedValue(agRow),
}))

vi.mock('../../src/config/knex-database.js', () => ({
  default: { getKnex: () => mockKnex },
}))

const { ConvocationAGModel } = await import(
  '../../src/models/ConvocationAG.js'
)

beforeEach(() => {
  vi.clearAllMocks()
})

// Build a local-calendar date string (YYYY-MM-DD) N days from today.
function dateInDays(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

describe('ConvocationAGModel.verifierDelai', () => {
  it('counts exactly 21 days for a date-only string and validates the delay', async () => {
    agRow = { id: 1, date: dateInDays(21) }

    const result = await ConvocationAGModel.verifierDelai(1)

    expect(result.jours_restants).toBe(21)
    expect(result.valide).toBe(true)
  })

  it('rejects when only 20 days remain (off-by-one boundary)', async () => {
    agRow = { id: 1, date: dateInDays(20) }

    const result = await ConvocationAGModel.verifierDelai(1)

    expect(result.jours_restants).toBe(20)
    expect(result.valide).toBe(false)
  })

  it('handles a Date object identically to a date string', async () => {
    const d = new Date()
    d.setDate(d.getDate() + 21)
    d.setHours(0, 0, 0, 0)
    agRow = { id: 1, date: d }

    const result = await ConvocationAGModel.verifierDelai(1)

    expect(result.jours_restants).toBe(21)
    expect(result.valide).toBe(true)
  })

  it('reports a past AG with a non-positive day count', async () => {
    agRow = { id: 1, date: dateInDays(-3) }

    const result = await ConvocationAGModel.verifierDelai(1)

    expect(result.jours_restants).toBe(-3)
    expect(result.valide).toBe(false)
  })

  it('returns invalide when the AG does not exist', async () => {
    agRow = undefined

    const result = await ConvocationAGModel.verifierDelai(999)

    expect(result.valide).toBe(false)
    expect(result.message).toBe('AG non trouvée')
  })
})
