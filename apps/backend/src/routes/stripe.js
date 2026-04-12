import { Router } from 'express'
import { StripeController } from '../controllers/StripeController.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Authenticated endpoints
router.post(
  '/checkout-session',
  requireAuth(),
  StripeController.createCheckoutSession
)
router.get(
  '/subscription',
  requireAuth(),
  StripeController.getSubscription
)
router.post(
  '/portal-session',
  requireAuth(),
  StripeController.createPortalSession
)
router.get(
  '/usage',
  requireAuth(),
  StripeController.getUsage
)

// Usage reporting (admin/cron trigger)
router.post(
  '/report-usage',
  requireAuth(),
  requireAdmin,
  StripeController.reportUsage
)

// Webhook — NO auth (verified via Stripe signature)
// Note: raw body parsing is handled in createApp.js
router.post('/webhook', StripeController.handleWebhook)

export default router
