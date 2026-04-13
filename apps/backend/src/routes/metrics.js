import { Router } from 'express'
import { register } from '../utils/metrics.js'
import logger from '../logger.js'

const router = Router()

/**
 * GET /metrics
 *
 * Exposes Prometheus-compatible metrics. This endpoint is intentionally
 * unauthenticated because Prometheus scrapers typically access it over a
 * private network. For deployments where the endpoint is exposed publicly,
 * set the METRICS_AUTH_TOKEN environment variable to require a bearer token
 * on every request.
 */
router.get('/', async (req, res) => {
  const expectedToken = process.env.METRICS_AUTH_TOKEN

  if (expectedToken) {
    const authHeader = req.headers.authorization || ''
    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || token !== expectedToken) {
      res.set('WWW-Authenticate', 'Bearer realm="metrics"')
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  try {
    const metrics = await register.metrics()
    res.set('Content-Type', 'text/plain; version=0.0.4')
    res.send(metrics)
  } catch (error) {
    logger.error('[metrics] Failed to collect metrics:', error)
    res.status(500).json({ error: 'Failed to collect metrics' })
  }
})

export default router
