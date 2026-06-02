import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const { requireStaff, requireAdminForDelete } = await import(
  '../../src/middleware/authorization.js'
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
})

describe('requireStaff', () => {
  it('returns 401 when unauthenticated', () => {
    const res = makeRes()
    const next = vi.fn()
    requireStaff({ user: null }, res, next)
    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 for the coproprietaire role', () => {
    const res = makeRes()
    const next = vi.fn()
    requireStaff(
      { user: { id: 7, role: 'coproprietaire' }, path: '/1/download', method: 'GET' },
      res,
      next
    )
    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('is case-insensitive on the role check', () => {
    const res = makeRes()
    const next = vi.fn()
    requireStaff(
      { user: { id: 7, role: 'Coproprietaire' }, path: '/x', method: 'GET' },
      res,
      next
    )
    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('allows syndic, admin and other staff roles through', () => {
    for (const role of ['syndic', 'admin', 'gestionnaire', 'comptable']) {
      const res = makeRes()
      const next = vi.fn()
      requireStaff({ user: { id: 1, role } }, res, next)
      expect(next).toHaveBeenCalledOnce()
      expect(res.statusCode).toBeNull()
    }
  })
})

describe('requireAdminForDelete', () => {
  it('blocks non-admin/syndic roles with 403', () => {
    const res = makeRes()
    const next = vi.fn()
    requireAdminForDelete(
      { user: { id: 3, role: 'gestionnaire' }, path: '/1', method: 'DELETE' },
      res,
      next
    )
    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('allows admin and syndic', () => {
    for (const role of ['admin', 'syndic']) {
      const res = makeRes()
      const next = vi.fn()
      requireAdminForDelete({ user: { id: 1, role } }, res, next)
      expect(next).toHaveBeenCalledOnce()
    }
  })
})
