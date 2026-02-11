import { Router } from 'express'
import { ExtranetController } from '../controllers/ExtranetController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/mon-profil', requireAuth(), ExtranetController.getMonProfil)
router.get('/documents/:coproprieteId', requireAuth(), ExtranetController.getEspaceDocuments)
router.get('/mon-compte', requireAuth(), ExtranetController.getMonCompte)
router.get('/mes-charges', requireAuth(), ExtranetController.getMesCharges)
router.get('/mes-appels-fonds', requireAuth(), ExtranetController.getMesAppelsFonds)
router.get('/mon-fonds-travaux', requireAuth(), ExtranetController.getMonFondsTravaux)
router.get('/conseil-syndical/:coproprieteId', requireAuth(), ExtranetController.getDonneesConseilSyndical)

export default router
