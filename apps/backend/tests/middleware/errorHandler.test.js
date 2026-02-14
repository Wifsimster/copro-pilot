import { describe, it, expect, vi } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

const { errorHandler, notFoundHandler } = await import('../../src/middleware/errorHandler.js')

function mockReqRes() {
  const req = { method: 'GET', path: '/api/test' }
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

// ─── errorHandler ──────────────────────────────────────────────────────

describe('errorHandler', () => {
  it('returns 500 for generic errors', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('Something broke')

    errorHandler(error, req, res, next)

    expect(res.statusCode).toBe(500)
    expect(res._body.error).toBeDefined()
  })

  it('maps ValidationError to 400', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('Bad input')
    error.name = 'ValidationError'

    errorHandler(error, req, res, next)

    expect(res.statusCode).toBe(400)
    expect(res._body.error).toBe('Validation Error')
  })

  it('maps UnauthorizedError to 401', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('No access')
    error.name = 'UnauthorizedError'

    errorHandler(error, req, res, next)

    expect(res.statusCode).toBe(401)
    expect(res._body.error).toBe('Unauthorized')
  })

  it('maps NotFoundError to 404', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('Not here')
    error.name = 'NotFoundError'

    errorHandler(error, req, res, next)

    expect(res.statusCode).toBe(404)
    expect(res._body.error).toBe('Resource Not Found')
  })

  it('uses statusCode from the error if provided', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('Conflict')
    error.statusCode = 409

    errorHandler(error, req, res, next)

    expect(res.statusCode).toBe(409)
  })

  it('includes stack trace in non-production environment', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('Dev error')
    error.stack = 'Error: Dev error\n    at test.js:1:1'

    const original = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    errorHandler(error, req, res, next)

    expect(res._body.stack).toBeDefined()
    process.env.NODE_ENV = original
  })

  it('hides stack trace in production', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('Prod error')
    error.stack = 'Error: Prod error\n    at test.js:1:1'

    const original = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    errorHandler(error, req, res, next)

    expect(res._body.stack).toBeUndefined()
    process.env.NODE_ENV = original
  })

  it('masks 500 error messages in production', () => {
    const { req, res, next } = mockReqRes()
    const error = new Error('Sensitive database info')

    const original = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    errorHandler(error, req, res, next)

    expect(res.statusCode).toBe(500)
    expect(res._body.error).toBe('Internal Server Error')
    process.env.NODE_ENV = original
  })
})

// ─── notFoundHandler ───────────────────────────────────────────────────

describe('notFoundHandler', () => {
  it('calls next with a 404 error', () => {
    const req = { method: 'GET', path: '/api/nonexistent' }
    const res = {}
    const next = vi.fn()

    notFoundHandler(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    const error = next.mock.calls[0][0]
    expect(error).toBeInstanceOf(Error)
    expect(error.statusCode).toBe(404)
    expect(error.name).toBe('NotFoundError')
    expect(error.message).toContain('GET')
    expect(error.message).toContain('/api/nonexistent')
  })
})
