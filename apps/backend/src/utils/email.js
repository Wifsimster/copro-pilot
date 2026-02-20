import logger from '../logger.js'

let transporter = null

async function getTransporter() {
  if (transporter) return transporter

  const isDev =
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test' ||
    !process.env.NODE_ENV

  if (isDev) {
    transporter = {
      async sendMail(options) {
        logger.info('[Email] Development mode — email logged:')
        logger.info(`  To:      ${options.to}`)
        logger.info(`  Subject: ${options.subject}`)
        if (options.html) {
          const preview = options.html
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 200)
          logger.info(`  Preview: ${preview}`)
        }
        return { messageId: `dev-${Date.now()}` }
      },
    }
  } else {
    const { default: nodemailer } = await import('nodemailer')

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  return transporter
}

export async function sendEmail({ to, subject, html, text }) {
  const transport = await getTransporter()
  const from = process.env.SMTP_FROM || 'noreply@copropilot.fr'

  try {
    const result = await transport.sendMail({ from, to, subject, html, text })
    logger.info(`[Email] Sent to ${to}: "${subject}" (${result.messageId})`)
    return result
  } catch (error) {
    logger.error(`[Email] Failed to send to ${to}: ${error.message}`)
    throw error
  }
}
