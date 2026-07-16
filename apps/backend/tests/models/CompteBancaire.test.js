import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createKnexMock } from '../helpers/knexMock.js'

const { knexMockState } = vi.hoisted(() => ({
  knexMockState: { knex: null },
}))

vi.mock('../../src/config/knex-database.js', () => ({
  default: { getKnex: () => knexMockState.knex },
}))

// encryption helpers are irrelevant to hasSeparateAccount; stub to no-op
vi.mock('../../src/utils/encryption.js', () => ({
  maybeEncrypt: v => v,
  maybeDecrypt: v => v,
}))

const { CompteBancaireModel } = await import(
  '../../src/models/CompteBancaire.js'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CompteBancaireModel.hasSeparateAccount', () => {
  it('returns true when a dedicated separate account exists', async () => {
    knexMockState.knex = createKnexMock({ count: '1' }).knex
    await expect(
      CompteBancaireModel.hasSeparateAccount(7)
    ).resolves.toBe(true)
  })

  it('returns false when none exists', async () => {
    knexMockState.knex = createKnexMock({ count: '0' }).knex
    await expect(
      CompteBancaireModel.hasSeparateAccount(7)
    ).resolves.toBe(false)
  })
})
