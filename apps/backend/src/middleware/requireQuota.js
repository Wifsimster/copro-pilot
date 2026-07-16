import { PLAN_QUOTAS } from '../config/stripe.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const getDb = () => knexDatabase.getKnex()

/*
 * QUOTA SEMANTICS — read before "fixing" the unscoped counts below.
 *
 * `coproprietes` and `lots` have NO ownership/tenant column: the schema has
 * no organization_id, no owner_id — the subscription/plan lives on the `user`
 * table, but the business entities are not linked to a user. CoproPilot is
 * therefore deployed **single-tenant per instance** (one syndic = one
 * deployment/database), and the global row counts below ARE the tenant's
 * counts. Scoping them "to the current user" is impossible without first
 * introducing a tenancy model across every table — a large epic, not a patch.
 *
 * See docs/architecture-tenancy.md.
 */

/**
 * Middleware to enforce copropriete quota on creation routes.
 * Must be used AFTER requireAuth().
 *
 * In self-hosted mode, this middleware is a no-op.
 */
export const requireCoproprieteQuota = () => {
  return async (req, res, next) => {
    if (process.env.LICENSING_MODE === 'self-hosted') {
      return next()
    }

    try {
      const db = getDb()
      const userPlan = req.user?.plan || 'gratuit'
      const quota = PLAN_QUOTAS[userPlan]

      if (!quota || quota.coproprietes === null) {
        return next()
      }

      const [{ count }] = await db('coproprietes')
        .count('id as count')

      const currentCount = parseInt(count, 10)

      if (currentCount >= quota.coproprietes) {
        const canUpgrade = ['gratuit', 'essentiel'].includes(userPlan)
        const hasOverage = quota.extraCoproPrice !== undefined

        if (hasOverage) {
          // Pro/Entreprise: allow but track overage
          return next()
        }

        return res.status(403).json({
          error: 'Quota de copropriétés atteint',
          message: canUpgrade
            ? `Votre plan ${userPlan} est limité à ${quota.coproprietes} copropriété(s). Passez au plan supérieur pour en gérer davantage.`
            : `Limite de ${quota.coproprietes} copropriétés atteinte.`,
          current_count: currentCount,
          limit: quota.coproprietes,
          current_plan: userPlan,
        })
      }

      next()
    } catch (error) {
      logger.error(
        `[requireQuota] Error checking copropriete quota: ${error.message}`
      )
      next()
    }
  }
}

/**
 * Middleware to enforce lot quota on creation routes.
 * Must be used AFTER requireAuth().
 *
 * In self-hosted mode, this middleware is a no-op.
 */
export const requireLotQuota = () => {
  return async (req, res, next) => {
    if (process.env.LICENSING_MODE === 'self-hosted') {
      return next()
    }

    try {
      const db = getDb()
      const userPlan = req.user?.plan || 'gratuit'
      const quota = PLAN_QUOTAS[userPlan]

      if (!quota || quota.lots === null || quota.lots === undefined) {
        return next()
      }

      const [{ count }] = await db('lots').count('id as count')
      const currentCount = parseInt(count, 10)

      if (currentCount >= quota.lots) {
        return res.status(403).json({
          error: 'Quota de lots atteint',
          message: `Votre plan ${userPlan} est limité à ${quota.lots} lots. Passez au plan supérieur pour gérer des lots illimités.`,
          current_count: currentCount,
          limit: quota.lots,
          current_plan: userPlan,
        })
      }

      next()
    } catch (error) {
      logger.error(
        `[requireQuota] Error checking lot quota: ${error.message}`
      )
      next()
    }
  }
}

/**
 * Get usage stats for a given user (coproprietes + users created).
 */
export async function getUserUsage(userId, userPlan) {
  const db = getDb()
  const quota = PLAN_QUOTAS[userPlan] || PLAN_QUOTAS.gratuit

  const [coproResult] = await db('coproprietes')
    .count('id as count')

  const [userResult] = await db('user')
    .whereNull('deletedAt')
    .count('id as count')

  const coproCount = parseInt(coproResult?.count || '0', 10)
  const userCount = parseInt(userResult?.count || '0', 10)

  const coproLimit = quota.coproprietes
  const userLimit = quota.users
  const extraCopros = coproLimit
    ? Math.max(0, coproCount - coproLimit)
    : 0
  const extraUsers = userLimit
    ? Math.max(0, userCount - userLimit)
    : 0
  const extraCoproCost = extraCopros * (quota.extraCoproPrice || 0)
  const extraUserCost = extraUsers * (quota.extraUserPrice || 0)

  return {
    coproprietes: {
      current: coproCount,
      limit: coproLimit,
      extra: extraCopros,
      extra_cost: extraCoproCost,
    },
    users: {
      current: userCount,
      limit: userLimit,
      extra: extraUsers,
      extra_cost: extraUserCost,
    },
    total_extra_cost: extraCoproCost + extraUserCost,
  }
}
