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
      apiVersion: '2025-03-31.basil',
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
 * Plan hierarchy for requirePlan middleware.
 * Higher index = higher tier.
 */
export const PLAN_HIERARCHY = ['gratuit', 'essentiel', 'pro', 'entreprise']
