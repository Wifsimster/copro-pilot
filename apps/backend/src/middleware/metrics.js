import { httpRequestDuration, httpRequestTotal } from '../utils/metrics.js'

/**
 * Express middleware that records Prometheus metrics for every HTTP request.
 *
 * Captures:
 *   - http_request_duration_seconds (Histogram)
 *   - http_requests_total           (Counter)
 *
 * Labels: method, route, status_code.
 *
 * The route label uses the matched Express route pattern when available
 * (e.g. `/api/coproprietes/:id`) and falls back to `req.path` otherwise,
 * which avoids high-cardinality metrics caused by raw dynamic segments.
 */
export const metricsMiddleware = (req, res, next) => {
  // Skip instrumentation of the scraping endpoint itself to avoid noise
  if (req.path === '/metrics') {
    return next()
  }

  const startTime = process.hrtime.bigint()

  res.on('finish', () => {
    const endTime = process.hrtime.bigint()
    const durationSeconds = Number(endTime - startTime) / 1e9

    const route =
      (req.route && req.route.path) ||
      req.baseUrl + (req.route?.path || '') ||
      req.path ||
      'unknown'

    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    }

    httpRequestDuration.observe(labels, durationSeconds)
    httpRequestTotal.inc(labels)
  })

  next()
}

export default metricsMiddleware
