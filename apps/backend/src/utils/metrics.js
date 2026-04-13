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

register.registerMetric(httpRequestDuration)
register.registerMetric(httpRequestTotal)
register.registerMetric(dbQueryDuration)
register.registerMetric(activeSessions)

export { register }
