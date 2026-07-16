import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createKnexMock } from '../helpers/knexMock.js'

vi.mock('../../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const { knexMockState } = vi.hoisted(() => ({
  knexMockState: { knex: null },
}))

vi.mock('../../src/config/knex-database.js', () => ({
  default: { getKnex: () => knexMockState.knex },
}))

const { requireLotQuota } = await import(
  '../../src/middleware/requireQuota.js'
)

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  delete process.env.LICENSING_MODE
})

afterEach(() => {
  delete process.env.LICENSING_MODE
})

describe('requireLotQuota', () => {
  it('returns 403 when the gratuit plan reached its 20-lot quota', async () => {
    knexMockState.knex = createKnexMock([{ count: '20' }]).knex
    const res = makeRes()
    const next = vi.fn()

    await requireLotQuota()({ user: { id: 1, plan: 'gratuit' } }, res, next)

    expect(res.statusCode).toBe(403)
    expect(res.body.error).toBe('Quota de lots atteint')
    expect(res.body.limit).toBe(20)
    expect(res.body.current_plan).toBe('gratuit')
    expect(next).not.toHaveBeenCalled()
  })

  it('defaults to the gratuit plan when the user has no plan', async () => {
    knexMockState.knex = createKnexMock([{ count: '25' }]).knex
    const res = makeRes()
    const next = vi.fn()

    await requireLotQuota()({ user: { id: 1 } }, res, next)

    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when under the quota', async () => {
    knexMockState.knex = createKnexMock([{ count: '19' }]).knex
    const res = makeRes()
    const next = vi.fn()

    await requireLotQuota()({ user: { id: 1, plan: 'gratuit' } }, res, next)

    expect(res.statusCode).toBeNull()
    expect(next).toHaveBeenCalled()
  })

  it('calls next without querying for plans with unlimited lots', async () => {
    const mock = createKnexMock([{ count: '9999' }])
    knexMockState.knex = mock.knex
    const res = makeRes()
    const next = vi.fn()

    await requireLotQuota()({ user: { id: 1, plan: 'essentiel' } }, res, next)

    expect(next).toHaveBeenCalled()
    expect(mock.knex).not.toHaveBeenCalled()
  })

  it('is a no-op in self-hosted mode', async () => {
    process.env.LICENSING_MODE = 'self-hosted'
    const mock = createKnexMock([{ count: '9999' }])
    knexMockState.knex = mock.knex
    const res = makeRes()
    const next = vi.fn()

    await requireLotQuota()({ user: { id: 1, plan: 'gratuit' } }, res, next)

    expect(next).toHaveBeenCalled()
    expect(mock.knex).not.toHaveBeenCalled()
  })

  it('fails open when the database query throws', async () => {
    const failingKnex = () => {
      throw new Error('db down')
    }
    knexMockState.knex = failingKnex
    const res = makeRes()
    const next = vi.fn()

    await requireLotQuota()({ user: { id: 1, plan: 'gratuit' } }, res, next)

    expect(next).toHaveBeenCalled()
  })
})
