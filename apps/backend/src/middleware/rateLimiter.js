import rateLimit from 'express-rate-limit'

/**
 * General API rate limiter
 * 200 requests per 15 minutes per IP in production. Outside production the cap
 * is raised so that local development and the E2E suite — which drive many
 * requests from a single IP — are not throttled.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 200 : 10000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Trop de requetes, veuillez reessayer plus tard',
  },
})

/**
 * Strict rate limiter for authentication endpoints
 * 10 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      'Trop de tentatives de connexion, veuillez reessayer dans 15 minutes',
  },
})
