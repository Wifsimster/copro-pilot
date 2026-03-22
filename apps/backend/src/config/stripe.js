import Stripe from 'stripe'
import logger from '../logger.js'

let stripeInstance = null

export function getStripe() {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      logger.warn(
        '[Stripe] STRIPE_SECRET_KEY not set — Stripe features disabled'
      )
      return null
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-09-30.clover',
    })
  }
  return stripeInstance
}

/**
 * Maps plan names to Stripe price IDs from environment variables.
 */
export const PLAN_PRICE_MAP = {
  essentiel: process.env.STRIPE_PRICE_ESSENTIEL,
  pro: process.env.STRIPE_PRICE_PRO,
  entreprise: process.env.STRIPE_PRICE_ENTREPRISE,
}

/**
 * Maps overage metered price IDs from environment variables.
 * These are Stripe metered prices for per-copro and per-user overages.
 */
export const OVERAGE_PRICE_MAP = {
  pro: {
    copropriete: process.env.STRIPE_PRICE_PRO_EXTRA_COPRO,
    user: process.env.STRIPE_PRICE_PRO_EXTRA_USER,
  },
  entreprise: {
    copropriete: process.env.STRIPE_PRICE_ENTREPRISE_EXTRA_COPRO,
    user: process.env.STRIPE_PRICE_ENTREPRISE_EXTRA_USER,
  },
}

/**
 * Plan hierarchy for requirePlan middleware.
 * Higher index = higher tier.
 */
export const PLAN_HIERARCHY = ['gratuit', 'essentiel', 'pro', 'entreprise']

/**
 * Plan quotas: copropriete and user limits per plan.
 * null = unlimited.
 */
export const PLAN_QUOTAS = {
  gratuit: { coproprietes: 1, users: 3 },
  essentiel: { coproprietes: 3, users: 5 },
  pro: {
    coproprietes: 20,
    users: 10,
    extraCoproPrice: 3,
    extraUserPrice: 5,
  },
  entreprise: {
    coproprietes: 50,
    users: 25,
    extraCoproPrice: 2,
    extraUserPrice: 4,
  },
}
