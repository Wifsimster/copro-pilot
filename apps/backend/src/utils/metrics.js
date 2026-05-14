import client from 'prom-client'

// Create a registry
const register = new client.Registry()
register.setDefaultLabels({ app: 'copro-pilot-backend' })

// Collect default Node.js metrics
client.collectDefaultMetrics({ register })

// Custom metrics
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10],
})

export const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
})

export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
})

export const activeSessions = new client.Gauge({
  name: 'active_sessions',
  help: 'Number of active user sessions',
})

// Real User Monitoring of Core Web Vitals (LCP, INP, CLS, FCP, TTFB).
// LCP/FCP/TTFB are reported in milliseconds, CLS is unitless (×1000 here),
// INP is in milliseconds. Buckets cover the typical CWV thresholds.
export const webVitals = new client.Histogram({
  name: 'web_vitals',
  help: 'Core Web Vitals measured in the browser (RUM)',
  labelNames: ['metric', 'rating'],
  buckets: [50, 100, 200, 300, 500, 800, 1200, 1800, 2500, 4000, 6000, 10000],
})

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)
register.registerMetric(dbQueryDuration)
register.registerMetric(activeSessions)
register.registerMetric(webVitals)

export { register }
