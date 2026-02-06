import logger from '../logger.js'

/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
    logger.error(`[ErrorHandler] ${req.method} ${req.path} - ${error.message}`)
    if (error.statusCode !== 404 || process.env.NODE_ENV === 'development') {
        logger.error(`[ErrorHandler] Stack: ${error.stack}`)
    }

    let statusCode = error.statusCode || 500
    let message = error.message || 'Internal Server Error'

    if (error.name === 'ValidationError') {
        statusCode = 400
        message = 'Validation Error'
    } else if (error.name === 'UnauthorizedError') {
        statusCode = 401
        message = 'Unauthorized'
    } else if (error.name === 'NotFoundError') {
        statusCode = 404
        message = 'Resource Not Found'
    }

    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
        message = 'Internal Server Error'
    }

    const response = { error: message }

    if (process.env.NODE_ENV !== 'production' && error.stack) {
        response.stack = error.stack
    }

    res.status(statusCode).json(response)
}

/**
 * Handle 404 errors for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route ${req.method} ${req.path} not found`)
    error.statusCode = 404
    error.name = 'NotFoundError'
    next(error)
}
