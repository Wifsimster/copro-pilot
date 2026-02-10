import { Router } from 'express'
import { ExportController } from '../controllers/ExportController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// PDF exports
router.get('/budget/:id/pdf', requireAuth(), ExportController.budgetPdf)
router.get('/appel-fonds/:id/pdf', requireAuth(), ExportController.appelFondsPdf)
router.get('/feuille-presence/:id/pdf', requireAuth(), ExportController.feuillePresencePdf)
router.get('/carnet-entretien/:coproprieteId/pdf', requireAuth(), ExportController.carnetEntretienPdf)
router.get('/etat-impayes/:coproprieteId/pdf', requireAuth(), ExportController.etatImpayesPdf)

// Excel exports
router.get('/coproprietaires/excel', requireAuth(), ExportController.coproprietairesExcel)
router.get('/balance-comptes/:coproprieteId/excel', requireAuth(), ExportController.balanceComptesExcel)
router.get('/etat-charges/:budgetId/excel', requireAuth(), ExportController.etatChargesExcel)
router.get('/etat-impayes/:coproprieteId/excel', requireAuth(), ExportController.etatImpayesExcel)

export default router
