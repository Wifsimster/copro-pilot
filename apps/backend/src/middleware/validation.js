/**
 * Validate JSON payload
 */
export const validateJSON = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'] || ''
        if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
            return res.status(400).json({
                error: 'Content-Type must be application/json'
            })
        }

        if (req.body === undefined && req.headers['content-length'] !== '0') {
            return res.status(400).json({
                error: 'Invalid JSON payload'
            })
        }
    }

    next()
}

/**
 * Validate ID parameter
 */
export const validateIdParam = (req, res, next) => {
    const { id } = req.params

    if (!id) {
        return res.status(400).json({
            error: 'ID parameter is required'
        })
    }

    const numId = parseInt(id)
    if (isNaN(numId) || numId <= 0) {
        return res.status(400).json({
            error: 'ID must be a valid positive number'
        })
    }

    next()
}
