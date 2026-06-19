import cache from '../utils/cache.js'
import logger from '../logger.js'

const MAX_ATTEMPTS = 5
const LOCKOUT_WINDOW_SEC = 15 * 60 // 15 minutes
const LOCKOUT_DURATION_SEC = 15 * 60 // 15 minutes

/**
 * Build cache keys for a given email address.
 */
function keys(email) {
  const normalized = email.toLowerCase().trim()
  return {
    attempts: `lockout:attempts:${normalized}`,
    locked: `lockout:locked:${normalized}`,
  }
}

/**
 * Middleware that intercepts POST /api/auth/sign-in/email
 * to enforce account lockout after repeated failed logins.
 *
 * Must be mounted AFTER express.json() so req.body is populated.
 * Better Auth's adapter (better-call) then reuses the parsed body,
 * avoiding the "body locked" error that Undici throws when the
 * request stream has already been consumed.
 */
export function accountLockout(req, res, next) {
  // Only intercept email sign-in attempts
  if (
    req.method !== 'POST' ||
    !req.url.startsWith('/api/auth/sign-in/email')
  ) {
    return next()
  }

  const email = req.body?.email
  if (!email || typeof email !== 'string') {
    return next()
  }

  const k = keys(email)

  // Check if account is currently locked out
  const lockedUntil = cache.get(k.locked)
  if (lockedUntil) {
    const retryAfter = Math.ceil((lockedUntil - Date.now()) / 1000)
    logger.warn(`Account lockout: blocked login attempt for ${email}`, {
      email,
      retryAfter,
    })
    res.set('Retry-After', String(Math.max(retryAfter, 1)))
    return res.status(429).json({
      error: 'Compte temporairement verrouille',
      message: `Trop de tentatives de connexion echouees. Reessayez dans ${Math.ceil(retryAfter / 60)} minute(s).`,
    })
  }

  // Intercept the response to count failures / reset on success
  const originalEnd = res.end

  res.end = function (chunk, ...args) {
    if (res.statusCode >= 400) {
      const attempts = (cache.get(k.attempts) || 0) + 1
      cache.set(k.attempts, attempts, LOCKOUT_WINDOW_SEC)

      logger.info(
        `Failed login attempt ${attempts}/${MAX_ATTEMPTS} for ${email}`,
        { email, attempts }
      )

      if (attempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION_SEC * 1000
        cache.set(k.locked, lockUntil, LOCKOUT_DURATION_SEC)
        cache.del(k.attempts)
        logger.warn(
          `Account locked out: ${email} after ${attempts} failed attempts`,
          { email, lockUntil: new Date(lockUntil).toISOString() }
        )
      }
    } else {
      cache.del(k.attempts)
      cache.del(k.locked)
    }

    return originalEnd.apply(res, [chunk, ...args])
  }

  next()
}
