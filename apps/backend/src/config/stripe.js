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

export const PLAN_CADENCES = ['monthly', 'yearly']

/**
 * Maps plan + cadence to Stripe price IDs from environment variables.
 * Each plan exposes both monthly and yearly prices.
 */
export const PLAN_PRICE_MAP = {
  essentiel: {
    monthly: process.env.STRIPE_PRICE_ESSENTIEL_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ESSENTIEL_YEARLY,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  entreprise: {
    monthly: process.env.STRIPE_PRICE_ENTREPRISE_MONTHLY,
    yearly: process.env.STRIPE_PRICE_ENTREPRISE_YEARLY,
  },
}

/**
 * Resolve a Stripe price ID for a given plan and cadence.
 * Returns undefined if either is unknown or unset.
 */
export function getPriceId(plan, cadence = 'monthly') {
  return PLAN_PRICE_MAP[plan]?.[cadence]
}

/**
 * Build a reverse-lookup map from priceId → { plan, cadence } so the webhook
 * can identify what was sold from a Stripe subscription's price.id.
 * Recomputed lazily so test setups that mutate process.env mid-run still work.
 */
let _reverseLookup = null
let _reverseLookupSnapshot = null
function buildReverseLookup() {
  const lookup = new Map()
  for (const [plan, byCadence] of Object.entries(PLAN_PRICE_MAP)) {
    for (const [cadence, priceId] of Object.entries(byCadence)) {
      if (priceId) lookup.set(priceId, { plan, cadence })
    }
  }
  return lookup
}

export function getPlanCadenceFromPriceId(priceId) {
  if (!priceId) return null
  const snapshot = JSON.stringify(PLAN_PRICE_MAP)
  if (!_reverseLookup || _reverseLookupSnapshot !== snapshot) {
    _reverseLookup = buildReverseLookup()
    _reverseLookupSnapshot = snapshot
  }
  return _reverseLookup.get(priceId) || null
}

/**
 * Validate that all expected price env vars are set. Logs a warning per
 * missing entry. Called once at module load to surface misconfigurations
 * early without blocking the boot in dev.
 */
export function validatePriceConfiguration() {
  const missing = []
  for (const [plan, byCadence] of Object.entries(PLAN_PRICE_MAP)) {
    for (const cadence of PLAN_CADENCES) {
      if (!byCadence[cadence]) missing.push(`${plan}/${cadence}`)
    }
  }
  if (missing.length) {
    logger.warn(
      `[Stripe] Missing price IDs for: ${missing.join(', ')} — checkout will fail for these combinations`
    )
  }
  return missing
}

validatePriceConfiguration()

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
