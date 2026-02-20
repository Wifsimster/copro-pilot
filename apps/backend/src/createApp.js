import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import methodOverride from 'method-override'
import helmet from 'helmet'
import { toNodeHandler } from 'better-auth/node'

import routes from './routes/index.js'
import { requestLogger } from './middleware/requestLogger.js'
import { validateJSON } from './middleware/validation.js'
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js'
import { auditLogger } from './middleware/auditLogger.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

export { errorHandler, notFoundHandler }

/**
 * Create and configure the Express application.
 *
 * Mounts all middleware and API routes but does NOT add the final
 * notFoundHandler / errorHandler.  The caller is responsible for
 * mounting any additional middleware (e.g. SPA serving) and then
 * calling `app.use(notFoundHandler)` + `app.use(errorHandler)` last.
 *
 * @param {object} options
 * @param {Function} [options.getDb] - Function returning the Knex instance (injected into req.db)
 * @param {object}  [options.auth] - Better Auth instance (mounted at /api/auth)
 * @returns {import('express').Express}
 */
export function createApp({ getDb, auth } = {}) {
  const app = express()

  const isProduction = process.env.NODE_ENV === 'production'

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              imgSrc: ["'self'", 'data:', 'blob:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameSrc: ["'none'"],
              baseUri: ["'self'"],
              formAction: ["'self'"],
            },
          }
        : false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  )

  // CORS configuration
  const frontendUrl = process.env.BASE_URL || process.env.FRONTEND_URL

  app.use(cors({
    origin: isProduction
      ? frontendUrl
      : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  }))

  // Better Auth handler before express.json()
  if (auth) {
    app.all('/api/auth/*splat', authLimiter, toNodeHandler(auth))
  }

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(methodOverride())

  app.set('query parser', 'extended')

  app.use(cookieParser())

  // Custom middleware
  app.use(requestLogger)
  app.use(validateJSON)

  // Inject database connection
  if (getDb) {
    app.use((req, res, next) => {
      req.db = getDb()
      next()
    })
  }

  // Audit logging for write operations
  app.use(auditLogger)

  // Rate limiting for API routes
  app.use('/api', apiLimiter)

  // Mount Express routes under /api prefix
  app.use('/api', routes)

  // Handler 404 pour les routes API
  app.use('/api', (req, res) => {
    res.status(404).json({
      error: 'Route API non trouvée',
      path: req.originalUrl,
      method: req.method
    })
  })

  return app
}
