import { AnalyticsEventModel } from '../models/AnalyticsEvent.js'
import logger from '../logger.js'

/**
 * Funnel analytics. Recording is best-effort: a failure to record an event
 * must never break the business action that triggered it (checkout, signup…),
 * so every recorder swallows and logs its own errors.
 */
class AnalyticsService {
  async record(event) {
    try {
      return await AnalyticsEventModel.record(event)
    } catch (error) {
      logger.error(
        `[AnalyticsService] Failed to record ${event.event_type}: ${error.message}`
      )
      return null
    }
  }

  recordSignup(userId, { source = null } = {}) {
    return this.record({ event_type: 'signup', user_id: userId, source })
  }

  recordActivation(userId, metadata = {}) {
    return this.record({
      event_type: 'activation',
      user_id: userId,
      metadata,
    })
  }

  recordConversion(userId, plan) {
    return this.record({ event_type: 'conversion', user_id: userId, plan })
  }

  /** cause: 'voluntary' | 'payment_failed' | 'trial_ended' | 'other' */
  recordChurn(userId, plan, cause = 'other') {
    return this.record({
      event_type: 'churn',
      user_id: userId,
      plan,
      cause,
    })
  }

  /**
   * Aggregate the funnel over a window. Returns absolute counts plus derived
   * rates. Rates are null when the denominator is zero (avoid 0/0 = NaN).
   */
  async getFunnel({ from, to } = {}) {
    const window = { from, to }
    const [signups, activations, conversions, churn] = await Promise.all([
      AnalyticsEventModel.countByType('signup', window),
      AnalyticsEventModel.countDistinctUsers('activation', window),
      AnalyticsEventModel.countByType('conversion', window),
      AnalyticsEventModel.churnByCause(window),
    ])

    const churnTotal = Object.values(churn).reduce((a, b) => a + b, 0)
    const rate = (num, denom) => (denom > 0 ? num / denom : null)

    return {
      window: { from: from ?? null, to: to ?? null },
      signups,
      activations,
      conversions,
      churn: { total: churnTotal, by_cause: churn },
      rates: {
        activation: rate(activations, signups),
        conversion: rate(conversions, signups),
        activation_to_paid: rate(conversions, activations),
      },
    }
  }
}

export const analyticsService = new AnalyticsService()
