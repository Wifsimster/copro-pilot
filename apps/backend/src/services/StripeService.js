import {
  getStripe,
  PLAN_PRICE_MAP,
  PLAN_QUOTAS,
  OVERAGE_PRICE_MAP,
} from '../config/stripe.js'
import { SubscriptionModel } from '../models/Subscription.js'
import { getUserUsage } from '../middleware/requireQuota.js'
import logger from '../logger.js'

class StripeService {
  /**
   * Create a Stripe Checkout Session for a paid plan.
   */
  async createCheckoutSession(userId, userEmail, plan) {
    try {
      const stripe = getStripe()
      if (!stripe) {
        throw new Error('Stripe is not configured')
      }

      const priceId = PLAN_PRICE_MAP[plan]
      if (!priceId) {
        throw new Error(`No Stripe price configured for plan: ${plan}`)
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
        metadata: { plan, user_id: userId },
      }

      // Reuse existing Stripe customer if available
      if (subscription?.stripe_customer_id) {
        sessionParams.customer = subscription.stripe_customer_id
      }

      const session = await stripe.checkout.sessions.create(sessionParams)
      logger.info(
        `[StripeService] Checkout session created for user ${userId}, plan ${plan}`
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
   */
  async handleCheckoutCompleted(session) {
    try {
      const userId = session.client_reference_id
      const plan = session.metadata?.plan || 'essentiel'
      const stripeCustomerId = session.customer
      const stripeSubscriptionId = session.subscription

      // Resolve plan quotas
      const quota = PLAN_QUOTAS[plan] || PLAN_QUOTAS.gratuit

      // Upsert subscription record with quota limits
      const subscription = await SubscriptionModel.upsertByStripeCustomerId(
        stripeCustomerId,
        {
          user_id: userId,
          stripe_subscription_id: stripeSubscriptionId,
          plan,
          status: 'active',
          copropriete_limit: quota.coproprietes ?? null,
          user_limit: quota.users ?? null,
        }
      )

      // Denormalize plan to user table for fast middleware checks
      await SubscriptionModel.updateUserPlan(userId, plan)

      logger.info(
        `[StripeService] Checkout completed: user ${userId} → plan ${plan}`
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

      await SubscriptionModel.update(subscription.user_id, {
        status: newStatus,
        current_period_end: periodEnd,
      })

      // If canceled, revert user plan to gratuit
      if (newStatus === 'canceled') {
        await SubscriptionModel.updateUserPlan(
          subscription.user_id,
          'gratuit'
        )
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

      await SubscriptionModel.update(subscription.user_id, {
        status: 'canceled',
      })
      await SubscriptionModel.updateUserPlan(
        subscription.user_id,
        'gratuit'
      )

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
   * Called periodically (e.g. daily cron or before invoice finalization).
   */
  async reportUsage(userId) {
    try {
      const stripe = getStripe()
      if (!stripe) return

      const subscription = await SubscriptionModel.getByUserId(userId)
      if (!subscription?.stripe_subscription_id) return

      const plan = subscription.plan
      const overagePrices = OVERAGE_PRICE_MAP[plan]
      if (!overagePrices) return

      const usage = await getUserUsage(userId, plan)

      // Get subscription items from Stripe to find metered items
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id,
        { expand: ['items.data'] }
      )

      for (const item of stripeSubscription.items.data) {
        const priceId = item.price?.id

        if (priceId === overagePrices.copropriete && usage.coproprietes.extra > 0) {
          await stripe.subscriptionItems.createUsageRecord(item.id, {
            quantity: usage.coproprietes.extra,
            action: 'set',
          })
          logger.info(
            `[StripeService] Reported ${usage.coproprietes.extra} extra copros for user ${userId}`
          )
        }

        if (priceId === overagePrices.user && usage.users.extra > 0) {
          await stripe.subscriptionItems.createUsageRecord(item.id, {
            quantity: usage.users.extra,
            action: 'set',
          })
          logger.info(
            `[StripeService] Reported ${usage.users.extra} extra users for user ${userId}`
          )
        }
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
