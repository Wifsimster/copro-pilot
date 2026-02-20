import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}

vi.mock('../../src/logger.js', () => ({
  default: mockLogger,
}))

const { requestLogger } = await import('../../src/middleware/requestLogger.js')

function mockReqRes(overrides = {}) {
  const req = {
    method: 'GET',
    path: '/api/coproprietes',
    ip: '127.0.0.1',
    headers: {},
    body: undefined,
    ...overrides,
  }
  const res = {
    statusCode: 200,
    json: vi.fn().mockReturnThis(),
  }
  const next = vi.fn()
  return { req, res, next }
}

describe('requestLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('skips logging for /health path', () => {
    const { req, res, next } = mockReqRes({ path: '/health' })

    requestLogger(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(mockLogger.info).not.toHaveBeenCalled()
  })

  it('skips logging for /favicon.ico path', () => {
    const { req, res, next } = mockReqRes({ path: '/favicon.ico' })

    requestLogger(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(mockLogger.info).not.toHaveBeenCalled()
  })

  it('logs the request method, path and IP', () => {
    const { req, res, next } = mockReqRes({
      method: 'GET',
      path: '/api/coproprietes',
      ip: '192.168.1.1',
    })

    requestLogger(req, res, next)

    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('GET')
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('/api/coproprietes')
    )
    expect(next).toHaveBeenCalled()
  })

  it('redacts password fields in POST body', () => {
    const { req, res, next } = mockReqRes({
      method: 'POST',
      path: '/api/auth/login',
      body: { email: 'test@test.com', password: 'secret123' },
    })

    requestLogger(req, res, next)

    const loggedBody = mockLogger.debug.mock.calls[0]?.[1]
    expect(loggedBody.email).toBe('[REDACTED]')
    expect(loggedBody.password).toBe('[REDACTED]')
  })

  it('redacts token fields in PUT body', () => {
    const { req, res, next } = mockReqRes({
      method: 'PUT',
      path: '/api/settings',
      body: { name: 'test', token: 'abc-secret-token' },
    })

    requestLogger(req, res, next)

    const loggedBody = mockLogger.debug.mock.calls[0]?.[1]
    expect(loggedBody.name).toBe('test')
    expect(loggedBody.token).toBe('[REDACTED]')
  })

  it('redacts secret and apikey fields', () => {
    const { req, res, next } = mockReqRes({
      method: 'PATCH',
      path: '/api/config',
      body: { secret: 'top-secret', apikey: 'key-123', name: 'ok' },
    })

    requestLogger(req, res, next)

    const loggedBody = mockLogger.debug.mock.calls[0]?.[1]
    expect(loggedBody.secret).toBe('[REDACTED]')
    expect(loggedBody.apikey).toBe('[REDACTED]')
    expect(loggedBody.name).toBe('ok')
  })

  it('does not mutate the original request body', () => {
    const body = { email: 'test@test.com', password: 'secret123' }
    const { req, res, next } = mockReqRes({
      method: 'POST',
      path: '/api/auth/login',
      body,
    })

    requestLogger(req, res, next)

    expect(body.password).toBe('secret123')
  })

  it('wraps res.json to log response status and duration', () => {
    const { req, res, next } = mockReqRes()
    const originalJson = res.json

    requestLogger(req, res, next)

    // res.json should have been replaced
    expect(res.json).not.toBe(originalJson)

    // Simulate sending a response
    res.statusCode = 200
    res.json({ data: 'ok' })

    // Should log the response (method, path, status code, duration)
    const responseLogs = mockLogger.info.mock.calls
    const responseLog = responseLogs.find(
      (call) => call[0].includes('200')
    )
    expect(responseLog).toBeDefined()
  })

  it('logs error responses (status >= 400)', () => {
    const { req, res, next } = mockReqRes()

    requestLogger(req, res, next)

    res.statusCode = 400
    res.json({ error: 'Bad request' })

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Error Response'),
      expect.objectContaining({ error: 'Bad request' })
    )
  })
})
