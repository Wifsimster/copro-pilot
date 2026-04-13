import { Router } from 'express'
import { SignatureRequestController } from '../controllers/SignatureRequestController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Webhook endpoint — no auth (Yousign calls this).
// Signature is verified via HMAC inside the controller.
router.post('/webhook', SignatureRequestController.handleWebhook)

// Authenticated endpoints
router.post('/', requireAuth(), SignatureRequestController.requestSignature)
router.get(
  '/document/:documentId',
  requireAuth(),
  SignatureRequestController.getByDocument
)
router.get('/:id', requireAuth(), SignatureRequestController.getById)
router.post(
  '/:id/cancel',
  requireAuth(),
  SignatureRequestController.cancel
)

export default router
