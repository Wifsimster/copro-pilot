import { Router } from 'express'
import { AgReportController } from '../controllers/AgReportController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get(
  '/:coproprieteId/annexe/:numero',
  requireAuth(),
  AgReportController.getAnnexe
)

router.get(
  '/:coproprieteId/pack-complet',
  requireAuth(),
  AgReportController.getPackComplet
)

export default router
