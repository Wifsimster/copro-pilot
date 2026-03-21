import { Router } from 'express'
import { ExportController } from '../controllers/ExportController.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'

const router = Router()

// All exports require Essentiel plan minimum

// PDF exports
router.get('/budget/:id/pdf', requireAuth(), requirePlan('essentiel'), ExportController.budgetPdf)
router.get('/appel-fonds/:id/pdf', requireAuth(), requirePlan('essentiel'), ExportController.appelFondsPdf)
router.get('/feuille-presence/:id/pdf', requireAuth(), requirePlan('essentiel'), ExportController.feuillePresencePdf)
router.get('/carnet-entretien/:coproprieteId/pdf', requireAuth(), requirePlan('essentiel'), ExportController.carnetEntretienPdf)
router.get('/etat-impayes/:coproprieteId/pdf', requireAuth(), requirePlan('essentiel'), ExportController.etatImpayesPdf)

// Excel exports
router.get('/coproprietaires/excel', requireAuth(), requirePlan('essentiel'), ExportController.coproprietairesExcel)
router.get('/balance-comptes/:coproprieteId/excel', requireAuth(), requirePlan('essentiel'), ExportController.balanceComptesExcel)
router.get('/etat-charges/:budgetId/excel', requireAuth(), requirePlan('essentiel'), ExportController.etatChargesExcel)
router.get('/etat-impayes/:coproprieteId/excel', requireAuth(), requirePlan('essentiel'), ExportController.etatImpayesExcel)

export default router
