import { Router } from 'express'
import { ComptabiliteReglementaireController as Ctrl } from '../controllers/ComptabiliteReglementaireController.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'

const router = Router()

// All comptabilité réglementaire requires Essentiel plan minimum
// (regulatory compliance = premium feature)

// Exercices comptables
router.get('/exercices/:coproprieteId', requireAuth(), requirePlan('essentiel'), Ctrl.getExercices)
router.get('/exercice/:id', requireAuth(), requirePlan('essentiel'), Ctrl.getExercice)
router.post('/exercice', requireAuth(), requirePlan('essentiel'), Ctrl.createExercice)
router.post('/exercice/:id/cloture', requireAuth(), requirePlan('essentiel'), Ctrl.clotureExercice)

// Plan comptable
router.get('/plan-comptable/:coproprieteId', requireAuth(), requirePlan('essentiel'), Ctrl.getPlanComptable)
router.post('/plan-comptable/initialiser', requireAuth(), requirePlan('essentiel'), Ctrl.initialiserPlanComptable)
router.post('/plan-comptable', requireAuth(), requirePlan('essentiel'), Ctrl.createCompte)
router.put('/plan-comptable/:id', requireAuth(), requirePlan('essentiel'), Ctrl.updateCompte)

// Journal, Grand Livre, Balance
router.get('/journal/:exerciceId', requireAuth(), requirePlan('essentiel'), Ctrl.getJournal)
router.get('/grand-livre/:exerciceId', requireAuth(), requirePlan('essentiel'), Ctrl.getGrandLivre)
router.get('/balance/:exerciceId', requireAuth(), requirePlan('essentiel'), Ctrl.getBalance)

// Ecritures
router.post('/ecriture', requireAuth(), requirePlan('essentiel'), Ctrl.createEcriture)
router.post('/generer-ecritures/:exerciceId', requireAuth(), requirePlan('essentiel'), Ctrl.genererEcritures)

// Annexes (loi ALUR)
router.get('/annexe1/:coproprieteId', requireAuth(), requirePlan('essentiel'), Ctrl.getAnnexe1)
router.get('/annexe2/:coproprieteId', requireAuth(), requirePlan('essentiel'), Ctrl.getAnnexe2)
router.get('/annexe3/:coproprieteId', requireAuth(), requirePlan('essentiel'), Ctrl.getAnnexe3)
router.get('/annexe4/:coproprieteId', requireAuth(), requirePlan('essentiel'), Ctrl.getAnnexe4)
router.get('/annexe5/:coproprieteId', requireAuth(), requirePlan('essentiel'), Ctrl.getAnnexe5)

export default router
