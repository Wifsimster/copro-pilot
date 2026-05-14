import { Router } from 'express'
import { webVitals } from '../utils/metrics.js'
import logger from '../logger.js'

const router = Router()

const ALLOWED_METRICS = new Set(['LCP', 'INP', 'CLS', 'FCP', 'TTFB'])
const ALLOWED_RATINGS = new Set(['good', 'needs-improvement', 'poor'])

/**
 * POST /api/web-vitals
 *
 * Anonymous Real User Monitoring endpoint. Accepts a single Core Web
 * Vital sample (LCP, INP, CLS, FCP, TTFB) and records it in a
 * Prometheus histogram so it can be scraped alongside backend metrics.
 *
 * Designed to be called with `navigator.sendBeacon`, which is why it
 * is excluded from CSRF (no custom headers) and requires no auth.
 * Rate limiting is provided by the global apiLimiter middleware.
 */
router.post('/', (req, res) => {
  const { metric, value, rating } = req.body ?? {}

  if (!ALLOWED_METRICS.has(metric)) {
    return res.status(400).json({ error: 'Unknown metric' })
  }
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return res.status(400).json({ error: 'Invalid value' })
  }
  if (rating !== undefined && !ALLOWED_RATINGS.has(rating)) {
    return res.status(400).json({ error: 'Invalid rating' })
  }

  // CLS is unitless and tiny (e.g. 0.05). Scale to fit the millisecond
  // histogram buckets so we can keep a single Histogram instrument.
  const observed = metric === 'CLS' ? value * 1000 : value

  webVitals.labels(metric, rating ?? 'unknown').observe(observed)

  logger.debug?.('[web-vitals] sample recorded', { metric, value, rating })
  res.status(204).end()
})

export default router
