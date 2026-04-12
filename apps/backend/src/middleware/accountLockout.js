import { Readable } from 'stream'
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
 * Must be mounted BEFORE the Better Auth handler.
 */
export function accountLockout(req, res, next) {
  // Only intercept email sign-in attempts
  if (
    req.method !== 'POST' ||
    !req.url.startsWith('/api/auth/sign-in/email')
  ) {
    return next()
  }

  // We need to parse the body ourselves since express.json()
  // hasn't run yet at this point in the middleware chain.
  let body = ''
  req.on('data', (chunk) => {
    body += chunk.toString()
    // Prevent abuse via large bodies
    if (body.length > 10_000) {
      body = ''
      req.destroy()
    }
  })

  req.on('end', () => {
    let email
    try {
      const parsed = JSON.parse(body)
      email = parsed.email
    } catch {
      // If we can't parse the body, let Better Auth handle it
      // Re-create a readable stream from the buffered body
      replayBody(req, body)
      return next()
    }

    if (!email) {
      replayBody(req, body)
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

    // Intercept the response to check for login failure
    const originalEnd = res.end
    const originalWrite = res.write
    const chunks = []

    res.write = function (chunk, ...args) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      return originalWrite.apply(res, [chunk, ...args])
    }

    res.end = function (chunk, ...args) {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      }

      // Check if login failed (non-2xx status)
      if (res.statusCode >= 400) {
        const attempts = (cache.get(k.attempts) || 0) + 1
        cache.set(k.attempts, attempts, LOCKOUT_WINDOW_SEC)

        logger.info(`Failed login attempt ${attempts}/${MAX_ATTEMPTS} for ${email}`, {
          email,
          attempts,
        })

        if (attempts >= MAX_ATTEMPTS) {
          const lockUntil = Date.now() + LOCKOUT_DURATION_SEC * 1000
          cache.set(k.locked, lockUntil, LOCKOUT_DURATION_SEC)
          cache.del(k.attempts)
          logger.warn(`Account locked out: ${email} after ${attempts} failed attempts`, {
            email,
            lockUntil: new Date(lockUntil).toISOString(),
          })
        }
      } else {
        // Successful login — reset the counter
        cache.del(k.attempts)
        cache.del(k.locked)
      }

      return originalEnd.apply(res, [chunk, ...args])
    }

    // Replay the body so Better Auth can read it
    replayBody(req, body)
    next()
  })
}

/**
 * Replace the request stream so downstream middleware
 * (including Better Auth / express.json) can re-read the body.
 */
function replayBody(req, body) {
  const readable = new Readable()
  readable.push(body)
  readable.push(null)

  // Copy over the original request properties
  req.headers['content-length'] = Buffer.byteLength(body)

  // Monkey-patch the request to replay the body
  req._readableState = readable._readableState
  req._read = readable._read.bind(readable)
  req.push = readable.push.bind(readable)
  req.unshift = readable.unshift.bind(readable)
  req.isPaused = readable.isPaused.bind(readable)
  req.read = readable.read.bind(readable)
  req.on = function (event, handler) {
    if (event === 'data' || event === 'end') {
      readable.on(event, handler)
    } else {
      Object.getPrototypeOf(req).on.call(req, event, handler)
    }
    return req
  }
}
