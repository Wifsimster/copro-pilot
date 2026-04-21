import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../src/logger.js', () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

const resendSend = vi.fn()
vi.mock('resend', () => {
  class Resend {
    constructor() {
      this.emails = { send: resendSend }
    }
  }
  return { Resend }
})

const nodemailerSendMail = vi.fn()
vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail: nodemailerSendMail }),
  },
}))

describe('sendEmail', () => {
  let sendEmail
  let _resetTransportForTests

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../../src/utils/email.js')
    sendEmail = mod.sendEmail
    _resetTransportForTests = mod._resetTransportForTests
    _resetTransportForTests()
    resendSend.mockReset()
    nodemailerSendMail.mockReset()
    delete process.env.NODE_ENV
    delete process.env.RESEND_API_KEY
    delete process.env.SMTP_HOST
    delete process.env.RESEND_FROM
    delete process.env.SMTP_FROM
  })

  afterEach(() => {
    _resetTransportForTests()
  })

  it('logs the email in dev mode instead of sending', async () => {
    process.env.NODE_ENV = 'development'
    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
    })
    expect(result.messageId).toMatch(/^dev-/)
    expect(resendSend).not.toHaveBeenCalled()
    expect(nodemailerSendMail).not.toHaveBeenCalled()
  })

  it('uses Resend when RESEND_API_KEY is set in production', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RESEND_API_KEY = 'test-key'
    process.env.RESEND_FROM = 'CoproPilot <noreply@copropilot.fr>'
    resendSend.mockResolvedValue({ data: { id: 'resend-abc' }, error: null })

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Hi',
      html: '<p>Hi</p>',
    })

    expect(resendSend).toHaveBeenCalledWith({
      from: 'CoproPilot <noreply@copropilot.fr>',
      to: 'user@example.com',
      subject: 'Hi',
      html: '<p>Hi</p>',
      text: undefined,
    })
    expect(result.messageId).toBe('resend-abc')
    expect(nodemailerSendMail).not.toHaveBeenCalled()
  })

  it('throws when Resend returns an error payload', async () => {
    process.env.NODE_ENV = 'production'
    process.env.RESEND_API_KEY = 'test-key'
    resendSend.mockResolvedValue({
      data: null,
      error: { message: 'invalid from' },
    })

    await expect(
      sendEmail({ to: 'user@example.com', subject: 'x', html: 'y' })
    ).rejects.toThrow(/Resend error: invalid from/)
  })

  it('falls back to SMTP when only SMTP_HOST is configured', async () => {
    process.env.NODE_ENV = 'production'
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'noreply@copropilot.fr'
    nodemailerSendMail.mockResolvedValue({ messageId: 'smtp-1' })

    const result = await sendEmail({
      to: 'user@example.com',
      subject: 'Hi',
      html: '<p>Hi</p>',
    })

    expect(nodemailerSendMail).toHaveBeenCalledOnce()
    expect(result.messageId).toBe('smtp-1')
    expect(resendSend).not.toHaveBeenCalled()
  })
})
