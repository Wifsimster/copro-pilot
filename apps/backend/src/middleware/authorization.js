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

/**
 * Middleware: require a staff role (anything other than `coproprietaire`)
 * for management endpoints that expose data across copropriétés.
 * Copropriétaires reach their own data through the dedicated /api/extranet
 * routes, so the generic management routes must not be accessible to them
 * (prevents cross-copropriété IDOR on documents, tenants, etc.).
 * Must be used AFTER requireAuth().
 */
export const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Non authentifie' })
  }

  if (req.user.role?.toLowerCase() === 'coproprietaire') {
    logger.warn('[Authorization] Copropriétaire accessed staff-only route', {
      userId: req.user.id,
      path: req.path,
      method: req.method,
    })
    return res.status(403).json({
      error: 'Acces refuse',
      message: 'Cette ressource est réservée au personnel du syndic',
    })
  }

  next()
}
