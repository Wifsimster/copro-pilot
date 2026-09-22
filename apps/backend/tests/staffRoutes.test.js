import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'

let role = 'coproprietaire'

vi.mock('../src/config/auth.js', () => ({
  getAuth: () => ({
    api: {
      getSession: async () => ({
        session: { id: 's1' },
        user: { id: 'u1', role },
      }),
    },
  }),
  initializeAuth: vi.fn(),
}))

vi.mock('../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const { createApp } = await import('../src/createApp.js')
const app = createApp()

describe('staff-only management routes', () => {
  const endpoints = [
    '/api/coproprietaires',
    '/api/paiements/copropriete/1',
    '/api/comptes-bancaires/copropriete/1',
    '/api/v1/lots/copropriete/1',
    '/api/tickets?copropriete_id=1',
  ]

  it.each(endpoints)('rejects a copropriétaire on GET %s', async url => {
    role = 'coproprietaire'
    const res = await request(app).get(url)
    expect(res.status).toBe(403)
  })

  it('rejects a copropriétaire POST to paiements', async () => {
    role = 'coproprietaire'
    const res = await request(app)
      .post('/api/paiements')
      .set('Cookie', 'csrf-token=t')
      .set('X-CSRF-Token', 't')
      .send({ coproprietaire_id: 1, montant: 5000 })
    expect(res.status).toBe(403)
  })
})
