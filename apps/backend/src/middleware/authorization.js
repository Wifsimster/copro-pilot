import logger from '../logger.js'

/**
 * Middleware: require admin or syndic role for destructive operations.
 * Must be used AFTER requireAuth().
 */
export const requireAdminForDelete = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifie' })
  }

  const role = req.user.role?.toLowerCase()
  if (role !== 'admin' && role !== 'syndic') {
    logger.warn('[Authorization] Non-admin/syndic delete attempt', {
      userId: req.user.id,
      path: req.path,
      method: req.method,
    })
    return res.status(403).json({
      error: 'Acces refuse',
      message:
        'Seuls les administrateurs et syndics peuvent supprimer des donnees',
    })
  }

  next()
}
