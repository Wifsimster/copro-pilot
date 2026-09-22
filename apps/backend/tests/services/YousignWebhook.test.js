import crypto from 'node:crypto'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

const { yousignService } = await import('../../src/services/YousignService.js')

describe('YousignService.verifyWebhookSignature', () => {
  const secret = 'test-secret'
  const rawBody = '{"event_name":"signature_request.done","data":{}}'
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  let previous

  beforeAll(() => {
    previous = process.env.YOUSIGN_WEBHOOK_SECRET
    process.env.YOUSIGN_WEBHOOK_SECRET = secret
  })

  afterAll(() => {
    if (previous === undefined) delete process.env.YOUSIGN_WEBHOOK_SECRET
    else process.env.YOUSIGN_WEBHOOK_SECRET = previous
  })

  it('accepts a bare hex signature', () => {
    expect(yousignService.verifyWebhookSignature(rawBody, hmac)).toBe(true)
  })

  it('accepts a sha256= prefixed signature', () => {
    expect(
      yousignService.verifyWebhookSignature(rawBody, `sha256=${hmac}`)
    ).toBe(true)
  })

  it('rejects a signature over different bytes', () => {
    expect(yousignService.verifyWebhookSignature(`${rawBody} `, hmac)).toBe(
      false
    )
  })
})
