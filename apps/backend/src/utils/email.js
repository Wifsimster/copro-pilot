import logger from '../logger.js'

let transport = null

function isDevMode() {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' ||
    !process.env.NODE_ENV
  )
}

function createDevTransport() {
  return {
    name: 'dev',
    async send({ to, subject, html }) {
      logger.info('[Email] Development mode — email logged:')
      logger.info(`  To:      ${to}`)
      logger.info(`  Subject: ${subject}`)
      if (html) {
        const preview = html
          .replace(/<[^>]+>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 200)
        logger.info(`  Preview: ${preview}`)
      }
      return { messageId: `dev-${Date.now()}` }
    },
  }
}

async function createResendTransport() {
  const { Resend } = await import('resend')
  const client = new Resend(process.env.RESEND_API_KEY)
  return {
    name: 'resend',
    async send({ from, to, subject, html, text }) {
      const { data, error } = await client.emails.send({
        from,
        to,
        subject,
        html,
        text,
      })
      if (error) {
        const message = error.message || JSON.stringify(error)
        throw new Error(`Resend error: ${message}`)
      }
      return { messageId: data?.id || `resend-${Date.now()}` }
    },
  }
}

async function createSmtpTransport() {
  const { default: nodemailer } = await import('nodemailer')
  const nodemailerTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
  return {
    name: 'smtp',
    async send({ from, to, subject, html, text }) {
      const result = await nodemailerTransport.sendMail({
        from,
        to,
        subject,
        html,
        text,
      })
      return { messageId: result.messageId }
    },
  }
}

async function getTransport() {
  if (transport) return transport

  if (isDevMode()) {
    transport = createDevTransport()
    return transport
  }

  if (process.env.RESEND_API_KEY) {
    transport = await createResendTransport()
    logger.info('[Email] Using Resend transport')
    return transport
  }

  if (process.env.SMTP_HOST) {
    transport = await createSmtpTransport()
    logger.info('[Email] Using SMTP transport')
    return transport
  }

  logger.warn(
    '[Email] No email provider configured (RESEND_API_KEY or SMTP_HOST). Falling back to console logging.'
  )
  transport = createDevTransport()
  return transport
}

export async function sendEmail({ to, subject, html, text, from }) {
  const t = await getTransport()
  const sender =
    from ||
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    'CoproPilot <noreply@copropilot.fr>'

  try {
    const result = await t.send({ from: sender, to, subject, html, text })
    logger.info(
      `[Email] Sent via ${t.name} to ${to}: "${subject}" (${result.messageId})`
    )
    return result
  } catch (error) {
    logger.error(
      `[Email] Failed to send via ${t.name} to ${to}: ${error.message}`
    )
    throw error
  }
}

export function _resetTransportForTests() {
  transport = null
}
