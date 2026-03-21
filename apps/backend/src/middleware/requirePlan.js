import { PLAN_HIERARCHY } from '../config/stripe.js'
import logger from '../logger.js'

/**
 * Middleware to enforce minimum plan requirements on routes.
 * Must be used AFTER requireAuth().
 *
 * In self-hosted mode (LICENSING_MODE=self-hosted), this middleware
 * is a no-op — all features are unlocked.
 *
 * @param {string} minimumPlan - Minimum plan required ('essentiel', 'pro', 'entreprise')
 * @returns {Function} Express middleware
 */
export const requirePlan = minimumPlan => {
  return (req, res, next) => {
    // Self-hosted mode: no plan enforcement
    if (process.env.LICENSING_MODE === 'self-hosted') {
      return next()
    }

    try {
      const userPlan = req.user?.plan || 'gratuit'
      const userLevel = PLAN_HIERARCHY.indexOf(userPlan)
      const requiredLevel = PLAN_HIERARCHY.indexOf(minimumPlan)

      if (requiredLevel === -1) {
        logger.error(
          `[requirePlan] Invalid plan name: ${minimumPlan}`
        )
        return res
          .status(500)
          .json({ error: 'Configuration erreur plan' })
      }

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          error: 'Plan insuffisant',
          message: `Cette fonctionnalité nécessite le plan ${minimumPlan}. Votre plan actuel : ${userPlan}.`,
          required_plan: minimumPlan,
          current_plan: userPlan,
        })
      }

      next()
    } catch (error) {
      logger.error(
        `[requirePlan] Error checking plan: ${error.message}`
      )
      return res
        .status(500)
        .json({ error: 'Erreur de vérification du plan' })
    }
  }
}
