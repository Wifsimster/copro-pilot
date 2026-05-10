import {
  getStripe,
  getPriceId,
  getPlanCadenceFromPriceId,
  PLAN_QUOTAS,
  OVERAGE_PRICE_MAP,
} from '../config/stripe.js'
import { SubscriptionModel } from '../models/Subscription.js'
import { getUserUsage } from '../middleware/requireQuota.js'
import { extranetPaymentService } from './ExtranetPaymentService.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

class StripeService {
  /**
   * Create a Stripe Checkout Session for a paid plan.
   * @param {string} userId
   * @param {string} userEmail
   * @param {string} plan      essentiel | pro | entreprise
   * @param {string} cadence   monthly | yearly (default monthly)
   */
  async createCheckoutSession(userId, userEmail, plan, cadence = 'monthly') {
    try {
      const stripe = getStripe()
      if (!stripe) {
        throw new Error('Stripe is not configured')
      }

      const priceId = getPriceId(plan, cadence)
      if (!priceId) {
        throw new Error(
          `No Stripe price configured for plan ${plan} (${cadence})`
        )
      }

      // Get or create subscription record to track stripe_customer_id
      let subscription = await SubscriptionModel.getByUserId(userId)
      const sessionParams = {
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.BASE_URL || 'http://localhost:3000'}/#/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:3000'}/#/landing`,
        client_reference_id: userId,
        customer_email: subscription?.stripe_customer_id
          ? undefined
          : userEmail,
        metadata: { plan, cadence, user_id: userId },
      }

      // Reuse existing Stripe customer if available
      if (subscription?.stripe_customer_id) {
        sessionParams.customer = subscription.stripe_customer_id
      }

      const session = await stripe.checkout.sessions.create(sessionParams)
      logger.info(
        `[StripeService] Checkout session created for user ${userId}, plan ${plan} (${cadence})`
      )
      return session
    } catch (error) {
      logger.error(
        `[StripeService] Error creating checkout session: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Create a Stripe Customer Portal session for self-service management.
   */
  async createPortalSession(userId) {
    try {
      const stripe = getStripe()
      if (!stripe) {
        throw new Error('Stripe is not configured')
      }

      const subscription = await SubscriptionModel.getByUserId(userId)
      if (!subscription?.stripe_customer_id) {
        throw new Error('No Stripe customer found for this user')
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/#/subscription`,
      })

      logger.info(
        `[StripeService] Portal session created for user ${userId}`
      )
      return session
    } catch (error) {
      logger.error(
        `[StripeService] Error creating portal session: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Get the current subscription status for a user.
   * Falls back to Stripe API if session_id is provided (post-checkout reconciliation).
   */
  async getSubscription(userId, sessionId) {
    try {
      let subscription = await SubscriptionModel.getByUserId(userId)

      // Post-checkout fallback: if subscription not yet in DB, reconcile from Stripe
      if ((!subscription || subscription.plan === 'gratuit') && sessionId) {
        const stripe = getStripe()
        if (stripe) {
          const session =
            await stripe.checkout.sessions.retrieve(sessionId)
          if (
            session.client_reference_id === userId &&
            session.payment_status === 'paid'
          ) {
            subscription = await this.handleCheckoutCompleted(session)
          }
        }
      }

      return subscription || { plan: 'gratuit', status: 'active' }
    } catch (error) {
      logger.error(
        `[StripeService] Error getting subscription: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Handle checkout.session.completed webhook event.
   * Dispatches to the correct service depending on the session type:
   *  - `coproprietaire_payment` → ExtranetPaymentService (extranet balance)
   *  - otherwise                → SaaS subscription handling
   */
  async handleCheckoutCompleted(session) {
    try {
      // Extranet copropriétaire payment (one-off, mode: payment)
      if (session.metadata?.type === 'coproprietaire_payment') {
        const paiement = await extranetPaymentService.handlePaymentSuccess(
          session.id
        )
        logger.info(
          `[StripeService] Extranet payment recorded via webhook for session ${session.id}`
        )
        return paiement
      }

      const userId = session.client_reference_id
      const plan = session.metadata?.plan || 'essentiel'
      const cadence = session.metadata?.cadence || 'monthly'
      const stripeCustomerId = session.customer
      const stripeSubscriptionId = session.subscription

      // Resolve plan quotas
      const quota = PLAN_QUOTAS[plan] || PLAN_QUOTAS.gratuit

      // Wrap both operations in a transaction to keep
      // subscription record and user plan in sync
      const subscription = await knexDatabase
        .getKnex()
        .transaction(async trx => {
          // Upsert subscription record with quota limits
          const sub =
            await SubscriptionModel.upsertByStripeCustomerId(
              stripeCustomerId,
              {
                user_id: userId,
                stripe_subscription_id: stripeSubscriptionId,
                plan,
                cadence,
                status: 'active',
                copropriete_limit: quota.coproprietes ?? null,
                user_limit: quota.users ?? null,
              },
              trx
            )

          // Denormalize plan to user table for fast middleware checks
          await SubscriptionModel.updateUserPlan(userId, plan, trx)

          return sub
        })

      logger.info(
        `[StripeService] Checkout completed: user ${userId} → plan ${plan} (${cadence})`
      )
      return subscription
    } catch (error) {
      logger.error(
        `[StripeService] Error handling checkout completed: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Handle customer.subscription.updated webhook event.
   */
  async handleSubscriptionUpdated(stripeSubscription) {
    try {
      const subscription =
        await SubscriptionModel.getByStripeSubscriptionId(
          stripeSubscription.id
        )
      if (!subscription) {
        logger.warn(
          `[StripeService] Subscription not found: ${stripeSubscription.id}`
        )
        return
      }

      const statusMap = {
        active: 'active',
        trialing: 'trialing',
        past_due: 'past_due',
        canceled: 'canceled',
        incomplete: 'incomplete',
        incomplete_expired: 'canceled',
        unpaid: 'past_due',
        paused: 'canceled',
      }

      const newStatus =
        statusMap[stripeSubscription.status] || 'active'
      const periodEnd = stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null

      // Reverse-lookup the active price to detect plan/cadence changes
      // performed via the Stripe Customer Portal.
      const activePriceId =
        stripeSubscription.items?.data?.[0]?.price?.id
      const resolved = getPlanCadenceFromPriceId(activePriceId)

      // Wrap both operations in a transaction to keep
      // subscription record and user plan in sync
      await knexDatabase.getKnex().transaction(async trx => {
        const update = {
          status: newStatus,
          current_period_end: periodEnd,
        }
        if (resolved) {
          update.plan = resolved.plan
          update.cadence = resolved.cadence
        }
        await SubscriptionModel.update(subscription.user_id, update, trx)

        // Propagate plan change to denormalized user.plan
        if (resolved && resolved.plan !== subscription.plan) {
          await SubscriptionModel.updateUserPlan(
            subscription.user_id,
            resolved.plan,
            trx
          )
          logger.info(
            `[StripeService] Plan changed via portal: user ${subscription.user_id} → ${resolved.plan} (${resolved.cadence})`
          )
        }

        // If canceled, revert user plan to gratuit
        if (newStatus === 'canceled') {
          await SubscriptionModel.updateUserPlan(
            subscription.user_id,
            'gratuit',
            trx
          )
        }
      })

      if (newStatus === 'canceled') {
        logger.info(
          `[StripeService] Subscription canceled for user ${subscription.user_id}`
        )
      }
    } catch (error) {
      logger.error(
        `[StripeService] Error handling subscription update: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Handle customer.subscription.deleted webhook event.
   */
  async handleSubscriptionDeleted(stripeSubscription) {
    try {
      const subscription =
        await SubscriptionModel.getByStripeSubscriptionId(
          stripeSubscription.id
        )
      if (!subscription) return

      // Wrap both operations in a transaction to keep
      // subscription record and user plan in sync
      await knexDatabase.getKnex().transaction(async trx => {
        await SubscriptionModel.update(
          subscription.user_id,
          { status: 'canceled' },
          trx
        )
        await SubscriptionModel.updateUserPlan(
          subscription.user_id,
          'gratuit',
          trx
        )
      })

      logger.info(
        `[StripeService] Subscription deleted for user ${subscription.user_id}`
      )
    } catch (error) {
      logger.error(
        `[StripeService] Error handling subscription deletion: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Report metered usage to Stripe for overage billing.
   * Uses Stripe Billing Meters API (2025-03-31.basil+).
   * Called periodically (e.g. daily cron or before invoice finalization).
   */
  async reportUsage(userId) {
    try {
      const stripe = getStripe()
      if (!stripe) return

      const subscription = await SubscriptionModel.getByUserId(userId)
      if (!subscription?.stripe_customer_id) return

      const plan = subscription.plan
      const overagePrices = OVERAGE_PRICE_MAP[plan]
      if (!overagePrices) return

      const usage = await getUserUsage(userId, plan)

      if (usage.coproprietes.extra > 0) {
        await stripe.billing.meterEvents.create({
          event_name: 'extra_coproprietes',
          payload: {
            stripe_customer_id: subscription.stripe_customer_id,
            value: String(usage.coproprietes.extra),
          },
        })
        logger.info(
          `[StripeService] Reported ${usage.coproprietes.extra} extra copros for user ${userId}`
        )
      }

      if (usage.users.extra > 0) {
        await stripe.billing.meterEvents.create({
          event_name: 'extra_users',
          payload: {
            stripe_customer_id: subscription.stripe_customer_id,
            value: String(usage.users.extra),
          },
        })
        logger.info(
          `[StripeService] Reported ${usage.users.extra} extra users for user ${userId}`
        )
      }

      // Update local overage tracking
      await SubscriptionModel.update(userId, {
        extra_coproprietes: usage.coproprietes.extra,
        extra_users: usage.users.extra,
      })
    } catch (error) {
      logger.error(
        `[StripeService] Error reporting usage for user ${userId}: ${error.message}`
      )
    }
  }

  /**
   * Report usage for all active subscriptions with overage-eligible plans.
   * Should be called by a periodic job (cron).
   */
  async reportAllUsage() {
    try {
      const subscriptions = await SubscriptionModel.getActiveWithOverage()
      let reported = 0

      for (const sub of subscriptions) {
        await this.reportUsage(sub.user_id)
        reported++
      }

      logger.info(
        `[StripeService] Usage reported for ${reported} subscriptions`
      )
      return reported
    } catch (error) {
      logger.error(
        `[StripeService] Error in bulk usage reporting: ${error.message}`
      )
      throw error
    }
  }

  /**
   * Handle invoice.payment_failed webhook event.
   */
  async handlePaymentFailed(invoice) {
    try {
      const subscription =
        await SubscriptionModel.getByStripeCustomerId(invoice.customer)
      if (!subscription) return

      await SubscriptionModel.update(subscription.user_id, {
        status: 'past_due',
      })

      logger.warn(
        `[StripeService] Payment failed for user ${subscription.user_id}`
      )
    } catch (error) {
      logger.error(
        `[StripeService] Error handling payment failure: ${error.message}`
      )
      throw error
    }
  }
}

export const stripeService = new StripeService()
