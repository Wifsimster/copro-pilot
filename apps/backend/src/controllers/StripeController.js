import { getStripe } from '../config/stripe.js'
import { stripeService } from '../services/StripeService.js'
import { getUserUsage } from '../middleware/requireQuota.js'
import logger from '../logger.js'

export class StripeController {
  /**
   * POST /api/stripe/checkout-session
   * Creates a Stripe Checkout Session for the authenticated user.
   */
  static async createCheckoutSession(req, res) {
    try {
      const { plan } = req.body
      if (!plan || !['essentiel', 'pro', 'entreprise'].includes(plan)) {
        return res
          .status(400)
          .json({ error: 'Plan invalide. Choisir: essentiel, pro, entreprise' })
      }

      const session = await stripeService.createCheckoutSession(
        req.user.id,
        req.user.email,
        plan
      )

      res.json({ data: { url: session.url, sessionId: session.id } })
    } catch (error) {
      logger.error(
        `[StripeController] Checkout session error: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de créer la session de paiement' })
    }
  }

  /**
   * GET /api/stripe/subscription
   * Returns the current user's subscription status.
   */
  static async getSubscription(req, res) {
    try {
      const sessionId = req.query.session_id
      const subscription = await stripeService.getSubscription(
        req.user.id,
        sessionId
      )
      res.json({ data: subscription })
    } catch (error) {
      logger.error(
        `[StripeController] Get subscription error: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de récupérer l\'abonnement' })
    }
  }

  /**
   * POST /api/stripe/portal-session
   * Creates a Stripe Customer Portal session for self-service management.
   */
  static async createPortalSession(req, res) {
    try {
      const session = await stripeService.createPortalSession(req.user.id)
      res.json({ data: { url: session.url } })
    } catch (error) {
      logger.error(
        `[StripeController] Portal session error: ${error.message}`
      )
      res
        .status(500)
        .json({ error: 'Impossible de créer la session de gestion' })
    }
  }

  /**
   * GET /api/stripe/usage
   * Returns the current user's plan usage (coproprietes + users vs limits).
   */
  static async getUsage(req, res) {
    try {
      const userPlan = req.user?.plan || 'gratuit'
      const usage = await getUserUsage(req.user.id, userPlan)
      res.json({ data: usage })
    } catch (error) {
      logger.error(
        `[StripeController] Get usage error: ${error.message}`
      )
      res
        .status(500)
        .json({ error: "Impossible de récupérer l'utilisation" })
    }
  }

  /**
   * POST /api/stripe/report-usage
   * Triggers usage reporting for all active overage-eligible subscriptions.
   * Intended to be called by a cron job or admin.
   */
  static async reportUsage(req, res) {
    try {
      const count = await stripeService.reportAllUsage()
      res.json({ data: { reported: count } })
    } catch (error) {
      logger.error(
        `[StripeController] Report usage error: ${error.message}`
      )
      res
        .status(500)
        .json({ error: "Erreur lors du reporting d'utilisation" })
    }
  }

  /**
   * POST /api/stripe/webhook
   * Handles Stripe webhook events (no auth — verified via signature).
   */
  static async handleWebhook(req, res) {
    const stripe = getStripe()
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe not configured' })
    }

    const sig = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      logger.error('[StripeController] STRIPE_WEBHOOK_SECRET not configured')
      return res.status(500).json({ error: 'Webhook secret not configured' })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    } catch (error) {
      logger.error(
        `[StripeController] Webhook signature verification failed: ${error.message}`
      )
      return res.status(400).json({ error: 'Invalid signature' })
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await stripeService.handleCheckoutCompleted(event.data.object)
          break
        case 'customer.subscription.updated':
          await stripeService.handleSubscriptionUpdated(event.data.object)
          break
        case 'customer.subscription.deleted':
          await stripeService.handleSubscriptionDeleted(event.data.object)
          break
        case 'invoice.upcoming':
          // Sync usage before Stripe finalizes the invoice
          if (event.data.object.subscription) {
            const sub = event.data.object
            logger.info(
              `[StripeController] Invoice upcoming for subscription ${sub.subscription}, syncing usage`
            )
            await stripeService.reportAllUsage()
          }
          break
        case 'invoice.payment_failed':
          await stripeService.handlePaymentFailed(event.data.object)
          break
        default:
          logger.debug(
            `[StripeController] Unhandled webhook event: ${event.type}`
          )
      }

      res.json({ received: true })
    } catch (error) {
      logger.error(
        `[StripeController] Webhook handler error: ${error.message}`
      )
      res.status(500).json({ error: 'Webhook handler failed' })
    }
  }
}
