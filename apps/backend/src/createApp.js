import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import methodOverride from 'method-override'
import helmet from 'helmet'
import compression from 'compression'
import { toNodeHandler } from 'better-auth/node'

import routes from './routes/index.js'
import metricsRoutes from './routes/metrics.js'
import { correlationId } from './middleware/correlationId.js'
import { requestLogger } from './middleware/requestLogger.js'
import { validateJSON } from './middleware/validation.js'
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js'
import { csrf } from './middleware/csrf.js'
import { auditLogger } from './middleware/auditLogger.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { accountLockout } from './middleware/accountLockout.js'
import { metricsMiddleware } from './middleware/metrics.js'

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

  // gzip/brotli compression for HTML/JS/CSS responses
  app.use(compression())

  // CORS configuration
  const frontendUrl = process.env.BASE_URL || process.env.FRONTEND_URL

  app.use(cors({
    origin: isProduction
      ? (frontendUrl || false)
      : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  }))

  // Account lockout before Better Auth (reads raw body itself)
  app.use(accountLockout)

  // Better Auth handler before express.json()
  if (auth) {
    app.all('/api/auth/*splat', authLimiter, toNodeHandler(auth))
  }

  // Stripe webhook needs raw body for signature verification (before express.json)
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' })
  )

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(methodOverride())

  app.set('query parser', 'extended')

  app.use(cookieParser())

  // CSRF protection (double-submit cookie)
  app.use(csrf)

  // Custom middleware
  app.use(correlationId)
  app.use(requestLogger)
  app.use(validateJSON)

  // Prometheus metrics middleware (records every HTTP request)
  app.use(metricsMiddleware)

  // Prometheus scrape endpoint — mounted at root (NOT under /api) so that
  // standard Prometheus scrapers can find it at /metrics. Exposed before
  // the /api rate limiter so scrape traffic is not throttled.
  app.use('/metrics', metricsRoutes)

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

  // Mount Express routes under /api prefix (backwards compatible)
  app.use('/api', routes)
  // Mount Express routes under /api/v1 prefix (versioned)
  app.use('/api/v1', routes)

  // Handler 404 pour les routes API versionnees
  app.use('/api/v1', (req, res) => {
    res.status(404).json({
      error: 'Route API non trouvée',
      path: req.originalUrl,
      method: req.method,
    })
  })

  // Handler 404 pour les routes API (legacy)
  app.use('/api', (req, res) => {
    res.status(404).json({
      error: 'Route API non trouvée',
      path: req.originalUrl,
      method: req.method,
    })
  })

  return app
}
