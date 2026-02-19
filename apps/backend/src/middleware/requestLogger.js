import logger from '../logger.js'

const EXCLUDE_PATHS = [
    '/health',
    '/favicon.ico'
]

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
    if (EXCLUDE_PATHS.some(path => req.path === path || req.path.startsWith(path))) {
        return next()
    }

    const start = Date.now()

    logger.info(`[${req.method}] ${req.path}`)

    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const logBody = (req.body && typeof req.body === 'object' && !Array.isArray(req.body))
            ? { ...req.body }
            : req.body

        if (logBody && typeof logBody === 'object' && !Array.isArray(logBody)) {
            const sensitiveFields = [
                'password', 'token', 'apikey', 'secret',
                'email', 'telephone', 'iban', 'adresse',
                'nom', 'prenom', 'adresse_correspondance',
            ]
            sensitiveFields.forEach(field => {
                if (logBody[field]) {
                    logBody[field] = '[REDACTED]'
                }
            })
        }

        logger.debug(`[${req.method}] ${req.path} - Body:`, logBody)
    }

    const originalJson = res.json
    res.json = function (body) {
        const duration = Date.now() - start
        logger.info(`[${req.method}] ${req.path} - ${res.statusCode} (${duration}ms)`)

        if (res.statusCode >= 400) {
            try {
                const errorBody = (body && typeof body === 'object') ? body : { message: String(body) }
                logger.error(`[${req.method}] ${req.path} - Error Response:`, errorBody)
            } catch (logError) {
                logger.error(`[${req.method}] ${req.path} - Error Response: (unable to serialize)`)
            }
        }

        return originalJson.call(this, body)
    }

    next()
}
