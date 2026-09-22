import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLog = vi.fn()
vi.mock('../../src/services/AuditService.js', () => ({
  auditService: { log: (...args) => mockLog(...args) },
}))

const { auditLogger, getEntityType } = await import(
  '../../src/middleware/auditLogger.js'
)

beforeEach(() => mockLog.mockClear())

describe('getEntityType', () => {
  it('matches the first path segment exactly', () => {
    expect(getEntityType('/lots/42')).toBe('lot')
    expect(getEntityType('/contrats-syndic/1')).toBe('contrat_syndic')
    expect(getEntityType('/contrats/1')).toBe('contrat')
    expect(getEntityType('/nope')).toBe('unknown')
  })
})

describe('auditLogger', () => {
  it('logs the full API path even after routers strip mount prefixes', () => {
    const req = {
      method: 'PUT',
      originalUrl: '/api/v1/lots/42?x=1',
      path: '/api/v1/lots/42',
      params: {},
      user: { id: 'u1' },
    }
    const res = { statusCode: 200, json: vi.fn() }
    auditLogger(req, res, () => {})

    // Inside the route handler Express has stripped '/api/v1/lots'
    req.path = '/42'
    req.params = { id: '42' }
    res.json({ data: { id: 42 } })

    expect(mockLog).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'lot',
        entity_id: '42',
        description: 'PUT /lots/42',
      })
    )
  })
})
