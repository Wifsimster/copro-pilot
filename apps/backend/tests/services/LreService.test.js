import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const { LreService, NoopLreProvider } = await import(
  '../../src/services/LreService.js'
)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('LreService', () => {
  it('defaults to the noop provider and reports not configured', async () => {
    const svc = new LreService()
    expect(svc.isConfigured()).toBe(false)
    const res = await svc.send({
      to: 'a@b.com',
      subject: 'Convocation',
      content: 'x',
    })
    expect(res.status).toBe('not_configured')
    expect(res.simulated).toBe(true)
  })

  it('reports configured with a real provider', () => {
    const provider = { name: 'ar24', send: vi.fn() }
    expect(new LreService(provider).isConfigured()).toBe(true)
  })

  it('delegates to the provider with validated input', async () => {
    const provider = {
      name: 'ar24',
      send: vi.fn().mockResolvedValue({
        providerId: 'ar24',
        trackingId: 'trk_1',
        status: 'sent',
      }),
    }
    const svc = new LreService(provider)
    const res = await svc.send({
      to: 'x@y.com',
      subject: 'Convocation AG',
      content: 'corps',
    })
    expect(provider.send).toHaveBeenCalledOnce()
    expect(res.trackingId).toBe('trk_1')
  })

  it('rejects an invalid recipient', async () => {
    const svc = new LreService(new NoopLreProvider())
    await expect(
      svc.send({ to: 'not-an-email', subject: 's', content: 'c' })
    ).rejects.toThrow(/Destinataire/)
  })

  it('rejects missing subject or content', async () => {
    const svc = new LreService(new NoopLreProvider())
    await expect(
      svc.send({ to: 'a@b.com', subject: '', content: 'c' })
    ).rejects.toThrow(/requis/)
  })
})
