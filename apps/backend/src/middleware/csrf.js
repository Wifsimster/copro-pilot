import crypto from 'node:crypto'
import logger from '../logger.js'

const CSRF_COOKIE = 'csrf-token'
const CSRF_HEADER = 'x-csrf-token'
const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE']

/**
 * Double-submit cookie CSRF protection middleware.
 *
 * - GET/HEAD/OPTIONS: sets a `csrf-token` cookie with a random value.
 * - POST/PUT/PATCH/DELETE: verifies that the `X-CSRF-Token` header
 *   matches the `csrf-token` cookie.
 *
 * Excluded paths:
 * - /api/stripe/webhook (uses its own Stripe signature verification)
 * - /api/auth/* (Better Auth handles its own security)
 */
export const csrf = (req, res, next) => {
  const path = req.originalUrl || req.url

  // Exclude Stripe webhook (signature-based verification)
  if (path.startsWith('/api/stripe/webhook')) {
    return next()
  }

  // Exclude Better Auth routes (own security)
  if (path.startsWith('/api/auth/')) {
    return next()
  }

  // For safe methods, issue a CSRF token cookie
  if (!MUTATING_METHODS.includes(req.method)) {
    if (!req.cookies?.[CSRF_COOKIE]) {
      const token = crypto.randomBytes(32).toString('hex')
      res.cookie(CSRF_COOKIE, token, {
        httpOnly: false, // JS must read it to send back in header
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      })
    }
    return next()
  }

  // For mutating methods, verify the token
  const cookieToken = req.cookies?.[CSRF_COOKIE]
  const headerToken = req.headers[CSRF_HEADER]

  if (!cookieToken || !headerToken) {
    logger.warn('[CSRF] Missing CSRF token', {
      path,
      method: req.method,
      hasCookie: !!cookieToken,
      hasHeader: !!headerToken,
    })
    return res.status(403).json({
      error: 'CSRF token missing',
    })
  }

  if (cookieToken !== headerToken) {
    logger.warn('[CSRF] CSRF token mismatch', {
      path,
      method: req.method,
    })
    return res.status(403).json({
      error: 'CSRF token mismatch',
    })
  }

  next()
}
