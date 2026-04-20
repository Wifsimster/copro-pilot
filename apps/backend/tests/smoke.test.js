import { describe, it, expect, vi, beforeAll } from 'vitest'
import request from 'supertest'

// Mock the auth module before any app code imports it
vi.mock('../src/config/auth.js', () => ({
  getAuth: vi.fn(() => {
    throw new Error('Auth not initialized')
  }),
  initializeAuth: vi.fn()
}))

// Silence the Winston logger during tests
vi.mock('../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn()
  }
}))

const { createApp, errorHandler, notFoundHandler } = await import('../src/createApp.js')

/**
 * Build a test-ready Express app (no database, no auth).
 * The error handlers are appended after createApp so the
 * middleware stack matches the production layout.
 */
function buildTestApp() {
  const app = createApp()
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}

describe('Backend smoke tests', () => {
  let app

  beforeAll(() => {
    app = buildTestApp()
  })

  // ─── Health & root endpoints ────────────────────────────────────────

  describe('GET /api/', () => {
    it('returns service info', async () => {
      const res = await request(app).get('/api/')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('service', 'CoproPilot Backend')
      expect(res.body).toHaveProperty('status', 'running')
      expect(res.body).toHaveProperty('version')
      expect(res.body).toHaveProperty('timestamp')
    })
  })

  describe('GET /api/health', () => {
    it('responds without crashing (db may be unavailable)', async () => {
      const res = await request(app).get('/api/health')

      // 200 if DB is up, 503 if DB is down – both are acceptable in smoke tests
      expect([200, 503]).toContain(res.status)
      expect(res.body).toHaveProperty('status')
      expect(res.body).toHaveProperty('timestamp')
    })
  })

  // ─── 404 handling ───────────────────────────────────────────────────

  describe('Unknown API routes', () => {
    it('returns 404 JSON for GET /api/nonexistent', async () => {
      const res = await request(app).get('/api/nonexistent')

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('returns 404 JSON for POST /api/nonexistent', async () => {
      const res = await request(app)
        .post('/api/nonexistent')
        .send({})
        .set('Content-Type', 'application/json')
        .set('Cookie', 'csrf-token=t')
        .set('X-CSRF-Token', 't')

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })
  })

  // ─── Protected routes require authentication ────────────────────────

  describe('Protected routes return 401/503 without auth', () => {
    // Only endpoints that have a GET / handler (root listing)
    // Many routes (lots, budgets, assemblees, etc.) require a
    // coproprieteId parameter and don't expose GET /.
    const protectedEndpoints = [
      '/api/coproprietes',
      '/api/coproprietaires',
      '/api/lots/copropriete/1',
      '/api/budgets/copropriete/1',
      '/api/assemblees/copropriete/1',
      '/api/incidents/copropriete/1',
      '/api/documents/copropriete/1',
      '/api/notifications',
      '/api/stats/dashboard'
    ]

    protectedEndpoints.forEach((endpoint) => {
      it(`GET ${endpoint} is not publicly accessible`, async () => {
        const res = await request(app).get(endpoint)

        // 401 (no session) or 503 (auth service unavailable) – both prove protection
        expect([401, 503]).toContain(res.status)
        expect(res.body).toHaveProperty('error')
      })
    })
  })

  // ─── JSON parsing ──────────────────────────────────────────────────

  describe('JSON body parsing', () => {
    it('accepts application/json content type', async () => {
      const res = await request(app)
        .post('/api/coproprietes')
        .send({ nom: 'Test' })
        .set('Content-Type', 'application/json')
        .set('Cookie', 'csrf-token=t')
        .set('X-CSRF-Token', 't')

      // Should not be a 400 "Content-Type" error
      expect(res.status).not.toBe(400)
    })

    it('rejects non-JSON content type on POST', async () => {
      const res = await request(app)
        .post('/api/coproprietes')
        .send('not json')
        .set('Content-Type', 'text/plain')
        .set('Cookie', 'csrf-token=t')
        .set('X-CSRF-Token', 't')

      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Content-Type/i)
    })
  })

  // ─── CORS headers ──────────────────────────────────────────────────

  describe('CORS', () => {
    it('includes CORS headers in the response', async () => {
      const res = await request(app)
        .get('/api/')
        .set('Origin', 'http://localhost:5173')

      expect(res.headers).toHaveProperty('access-control-allow-credentials', 'true')
    })
  })
})
