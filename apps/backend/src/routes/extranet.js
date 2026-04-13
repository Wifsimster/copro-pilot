import { Router } from 'express'
import { ExtranetController } from '../controllers/ExtranetController.js'
import { ExtranetPaymentController } from '../controllers/ExtranetPaymentController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/dashboard', requireAuth(), ExtranetController.getDashboard)
router.get('/mon-profil', requireAuth(), ExtranetController.getMonProfil)
router.get('/documents/:coproprieteId', requireAuth(), ExtranetController.getEspaceDocuments)
router.get('/mon-compte', requireAuth(), ExtranetController.getMonCompte)
router.get('/mes-charges', requireAuth(), ExtranetController.getMesCharges)
router.get('/mes-appels-fonds', requireAuth(), ExtranetController.getMesAppelsFonds)
router.get('/mon-fonds-travaux', requireAuth(), ExtranetController.getMonFondsTravaux)
router.get('/conseil-syndical/:coproprieteId', requireAuth(), ExtranetController.getDonneesConseilSyndical)

// Right to rectification (GDPR Art. 16)
router.put('/mon-profil', requireAuth(), ExtranetController.updateMonProfil)
router.put('/mon-compte', requireAuth(), ExtranetController.updateMonCompte)

// Online payments (Stripe Checkout) — protected by requireAuth.
// The controller verifies the user is linked to a coproprietaire.
router.post(
  '/payments/checkout',
  requireAuth(),
  ExtranetPaymentController.createCheckoutSession
)
router.post(
  '/payments/confirm',
  requireAuth(),
  ExtranetPaymentController.confirmPayment
)

export default router
