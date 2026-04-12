import crypto from 'node:crypto'

/**
 * Correlation ID middleware.
 *
 * Reuses the incoming `X-Request-Id` header when present, otherwise
 * generates a new UUID v4 via crypto.randomUUID().
 *
 * - Sets `req.id` for downstream middleware / handlers.
 * - Adds `X-Request-Id` response header so callers can correlate.
 */
export const correlationId = (req, res, next) => {
  const id = req.headers['x-request-id'] || crypto.randomUUID()
  req.id = id
  res.setHeader('X-Request-Id', id)
  next()
}
