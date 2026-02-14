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

// Mock auth module
const mockGetSession = vi.fn()
const mockGetAuth = vi.fn()

vi.mock('../../src/config/auth.js', () => ({
  getAuth: (...args) => mockGetAuth(...args),
}))

vi.mock('better-auth/node', () => ({
  fromNodeHeaders: vi.fn((headers) => headers),
}))

const { requireAuth, requireAdmin } = await import('../../src/middleware/auth.js')

function mockReqRes(overrides = {}) {
  const req = {
    method: 'GET',
    path: '/api/test',
    headers: {},
    user: null,
    session: null,
    ...overrides,
  }
  const res = {
    statusCode: 200,
    _body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this._body = body
      return this
    },
  }
  const next = vi.fn()
  return { req, res, next }
}

// ─── requireAuth ───────────────────────────────────────────────────────

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 503 when auth service is not initialized', async () => {
    mockGetAuth.mockImplementation(() => {
      throw new Error('Auth not initialized')
    })

    const { req, res, next } = mockReqRes()
    const middleware = requireAuth()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(503)
    expect(res._body.error).toContain('authentification')
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when session is null', async () => {
    mockGetAuth.mockReturnValue({
      api: { getSession: vi.fn().mockResolvedValue(null) },
    })

    const { req, res, next } = mockReqRes()
    const middleware = requireAuth()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when session exists but user is missing', async () => {
    mockGetAuth.mockReturnValue({
      api: { getSession: vi.fn().mockResolvedValue({ session: {}, user: null }) },
    })

    const { req, res, next } = mockReqRes()
    const middleware = requireAuth()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 when user has no id', async () => {
    mockGetAuth.mockReturnValue({
      api: {
        getSession: vi.fn().mockResolvedValue({
          session: { id: 'sess-1' },
          user: { email: 'test@test.com' },
        }),
      },
    })

    const { req, res, next } = mockReqRes()
    const middleware = requireAuth()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('attaches user and session to req on valid session', async () => {
    const fakeUser = { id: 'usr-1', email: 'test@test.com', role: 'user' }
    const fakeSession = { id: 'sess-1', userId: 'usr-1' }

    mockGetAuth.mockReturnValue({
      api: {
        getSession: vi.fn().mockResolvedValue({
          session: fakeSession,
          user: fakeUser,
        }),
      },
    })

    const { req, res, next } = mockReqRes()
    const middleware = requireAuth()

    await middleware(req, res, next)

    expect(req.user).toEqual(fakeUser)
    expect(req.session).toEqual(fakeSession)
    expect(next).toHaveBeenCalledOnce()
  })

  it('returns 503 on connection refused errors', async () => {
    const connError = new Error('Connection refused')
    connError.code = 'ECONNREFUSED'

    mockGetAuth.mockReturnValue({
      api: { getSession: vi.fn().mockRejectedValue(connError) },
    })

    const { req, res, next } = mockReqRes()
    const middleware = requireAuth()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(503)
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 401 on generic session retrieval error', async () => {
    mockGetAuth.mockReturnValue({
      api: { getSession: vi.fn().mockRejectedValue(new Error('Some error')) },
    })

    const { req, res, next } = mockReqRes()
    const middleware = requireAuth()

    await middleware(req, res, next)

    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })
})

// ─── requireAdmin ──────────────────────────────────────────────────────

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 500 when used without requireAuth (no user on req)', async () => {
    const { req, res, next } = mockReqRes({ user: null, session: null })

    await requireAdmin(req, res, next)

    expect(res.statusCode).toBe(500)
    expect(res._body.error).toContain('configuration')
    expect(next).not.toHaveBeenCalled()
  })

  it('returns 403 for non-admin user', async () => {
    const { req, res, next } = mockReqRes({
      user: { id: '1', email: 'user@test.com', role: 'user' },
      session: { id: 'sess-1' },
    })

    await requireAdmin(req, res, next)

    expect(res.statusCode).toBe(403)
    expect(res._body.error).toContain('refusé')
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next() for admin user', async () => {
    const { req, res, next } = mockReqRes({
      user: { id: '1', email: 'admin@test.com', role: 'admin' },
      session: { id: 'sess-1' },
    })

    await requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('handles case-insensitive admin role', async () => {
    const { req, res, next } = mockReqRes({
      user: { id: '1', email: 'admin@test.com', role: 'Admin' },
      session: { id: 'sess-1' },
    })

    await requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })

  it('returns 403 when role is undefined', async () => {
    const { req, res, next } = mockReqRes({
      user: { id: '1', email: 'user@test.com' },
      session: { id: 'sess-1' },
    })

    await requireAdmin(req, res, next)

    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })
})
