import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ar24Signature,
  ar24Decrypt,
  ar24Date,
} from '../../src/services/lre/ar24Signature.js'
import { Ar24LreProvider } from '../../src/services/lre/Ar24LreProvider.js'

vi.mock('../../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const DATE = '15-07-2026 10:30:00'
const KEY = 'test-private-key'

describe('ar24Signature', () => {
  it('is deterministic for a fixed date + key', () => {
    expect(ar24Signature(DATE, KEY)).toBe(ar24Signature(DATE, KEY))
  })

  it('changes when the date or key changes', () => {
    expect(ar24Signature(DATE, KEY)).not.toBe(
      ar24Signature('16-07-2026 10:30:00', KEY)
    )
    expect(ar24Signature(DATE, KEY)).not.toBe(ar24Signature(DATE, 'other'))
  })

  it('produces valid base64', () => {
    const sig = ar24Signature(DATE, KEY)
    expect(sig).toMatch(/^[A-Za-z0-9+/]+={0,2}$/)
  })

  it('requires date and privateKey', () => {
    expect(() => ar24Signature('', KEY)).toThrow(/required/)
    expect(() => ar24Signature(DATE, '')).toThrow(/required/)
  })

  it('round-trips through decrypt with the same key material', () => {
    // The signature is AES-256-CBC of the date; decrypting it yields the date.
    const sig = ar24Signature(DATE, KEY)
    expect(ar24Decrypt(sig, DATE, KEY)).toBe(DATE)
  })
})

describe('ar24Date', () => {
  it('formats as d-m-Y H:i:s', () => {
    const d = new Date(2026, 6, 5, 9, 4, 3) // 5 Jul 2026 09:04:03 (local)
    expect(ar24Date(d)).toBe('05-07-2026 09:04:03')
  })
})

describe('Ar24LreProvider', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requires token and privateKey', () => {
    expect(() => new Ar24LreProvider({})).toThrow(/token and privateKey/)
  })

  it('reports its name and selects the sandbox base url', () => {
    const p = new Ar24LreProvider({ token: 't', privateKey: KEY })
    expect(p.name).toBe('ar24')
    expect(p.baseUrl).toContain('sandbox.ar24.fr')
  })

  it('selects the prod base url when env=prod', () => {
    const p = new Ar24LreProvider({ token: 't', privateKey: KEY, env: 'prod' })
    expect(p.baseUrl).toBe('https://app.ar24.fr/api')
  })

  it('builds auth params with token, date and a matching signature', () => {
    const p = new Ar24LreProvider({ token: 'tok', privateKey: KEY })
    const now = new Date(2026, 6, 15, 10, 30, 0)
    const params = p.buildAuthParams({ to_email: 'a@b.com' }, now)
    expect(params.token).toBe('tok')
    expect(params.to_email).toBe('a@b.com')
    expect(params.signature).toBe(ar24Signature(params.date, KEY))
  })

  it('send() posts authenticated params and maps the tracking id', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 'eml_1', status: 'sent' })),
    })
    const p = new Ar24LreProvider({
      token: 'tok',
      privateKey: KEY,
      fetchImpl,
    })
    const res = await p.send({
      to: 'x@y.com',
      subject: 'Convocation',
      content: 'corps',
      metadata: { senderId: 'usr_1' },
    })
    expect(fetchImpl).toHaveBeenCalledOnce()
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('sandbox.ar24.fr')
    expect(opts.body).toContain('token=tok')
    expect(opts.body).toContain('signature=')
    expect(res.trackingId).toBe('eml_1')
    expect(res.providerId).toBe('ar24')
  })

  it('throws on an error response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('invalid token'),
    })
    const p = new Ar24LreProvider({ token: 't', privateKey: KEY, fetchImpl })
    await expect(
      p.send({ to: 'x@y.com', subject: 's', content: 'c' })
    ).rejects.toThrow(/AR24 401/)
  })
})
