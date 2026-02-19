import { fromNodeHeaders } from 'better-auth/node'
import logger from '../logger.js'
import { getAuth } from '../config/auth.js'

/**
 * Middleware d'authentification pour les routes API
 */
export const requireAuth = () => {
    return async (req, res, next) => {
        try {
            let auth
            try {
                auth = getAuth()
            } catch (error) {
                logger.error('[Auth] Auth service not initialized', {
                    error: error.message,
                    path: req.path,
                    method: req.method
                })
                return res.status(503).json({
                    error: 'Service d\'authentification non disponible',
                    message: 'Le service d\'authentification n\'est pas initialisé'
                })
            }

            const nodeHeaders = fromNodeHeaders(req.headers)

            let session
            try {
                session = await auth.api.getSession({
                    headers: nodeHeaders
                })
            } catch (error) {
                logger.error('[Auth] Session retrieval failed', {
                    error: error.message,
                    path: req.path,
                    method: req.method
                })

                if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
                    return res.status(503).json({
                        error: 'Service d\'authentification indisponible'
                    })
                }

                return res.status(401).json({
                    error: 'Non authentifié',
                    message: 'Votre session a expiré ou est invalide'
                })
            }

            if (!session || !session.session || !session.user || !session.user.id) {
                return res.status(401).json({
                    error: 'Non authentifié',
                    message: 'Vous devez être connecté pour accéder à cette ressource'
                })
            }

            req.user = session.user
            req.session = session.session

            next()
        } catch (error) {
            logger.error('[Auth] Unexpected error in authentication middleware', {
                error: error.message,
                path: req.path,
                method: req.method
            })
            return res.status(500).json({
                error: 'Erreur d\'authentification'
            })
        }
    }
}

/**
 * Middleware pour vérifier le rôle admin
 * Doit être utilisé APRÈS requireAuth
 */
export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.session) {
            return res.status(500).json({
                error: 'Erreur de configuration',
                message: 'Middleware requireAdmin doit être utilisé après requireAuth'
            })
        }

        const userRole = req.user.role?.toLowerCase()
        const isAdmin = userRole === 'admin'

        if (!isAdmin) {
            logger.warn('[Auth] Non-admin user attempted to access admin route', {
                userId: req.user.id,
                path: req.path
            })
            return res.status(403).json({
                error: 'Accès refusé',
                message: 'Vous devez être administrateur pour accéder à cette ressource'
            })
        }

        next()
    } catch (error) {
        logger.error('[Auth] Error in requireAdmin middleware', {
            error: error.message,
            path: req.path
        })
        return res.status(500).json({
            error: 'Erreur d\'autorisation'
        })
    }
}
