import winston from 'winston'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production'

// Determine log directory (only used in development)
const getLogDir = () => {
  if (fs.existsSync('/app/logs')) {
    return '/app/logs'
  }
  return path.join(__dirname, '../../logs')
}

const level =
  process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')

const hostname = os.hostname()
const environment = process.env.NODE_ENV || 'development'

// Inject correlation / request id (req.id) when the caller passes a
// `req` in the log metadata. Keeps call-sites simple:
//   logger.info('message', { req })
const reqIdFormat = winston.format(info => {
  if (info.req && info.req.id) {
    info.requestId = info.req.id
  }
  if (info.req) {
    delete info.req
  }
  return info
})()

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  reqIdFormat,
  winston.format.json()
)

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  reqIdFormat,
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // Hide defaultMeta fields from the dev console to keep it readable
    const { service, environment, hostname, ...rest } = meta
    let msg = `${timestamp} [${level}]: ${message}`
    if (Object.keys(rest).length > 0) {
      msg += ` ${JSON.stringify(rest)}`
    }
    return msg
  })
)

const defaultMeta = {
  service: 'copro-pilot-backend',
  environment,
  hostname,
}

const transports = []
const exceptionHandlers = []
const rejectionHandlers = []

if (isProduction) {
  // Production: stdout only (JSON). Container log drivers / aggregators
  // (Loki, CloudWatch, Datadog, ...) pick it up from there.
  transports.push(
    new winston.transports.Console({
      format: jsonFormat,
      handleExceptions: true,
      handleRejections: true,
    })
  )
} else {
  // Development: pretty console + file transports for local inspection
  const logDir = getLogDir()
  if (!fs.existsSync(logDir)) {
    try {
      fs.mkdirSync(logDir, { recursive: true })
    } catch (error) {
      console.warn(
        `Impossible de créer le répertoire de logs: ${logDir}`,
        error.message
      )
    }
  }

  transports.push(
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logDir, 'application.log'),
      format: jsonFormat,
      maxsize: 10485760,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 10485760,
      maxFiles: 5,
    })
  )
  exceptionHandlers.push(
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: jsonFormat,
    })
  )
  rejectionHandlers.push(
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: jsonFormat,
    })
  )
}

const logger = winston.createLogger({
  level,
  format: jsonFormat,
  defaultMeta,
  transports,
  exceptionHandlers: exceptionHandlers.length ? exceptionHandlers : undefined,
  rejectionHandlers: rejectionHandlers.length ? rejectionHandlers : undefined,
})

export default logger
