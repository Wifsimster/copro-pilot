import { Router } from 'express'
import { ComptabiliteReglementaireController as Ctrl } from '../controllers/ComptabiliteReglementaireController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Exercices comptables
router.get('/exercices/:coproprieteId', requireAuth(), Ctrl.getExercices)
router.get('/exercice/:id', requireAuth(), Ctrl.getExercice)
router.post('/exercice', requireAuth(), Ctrl.createExercice)
router.post('/exercice/:id/cloture', requireAuth(), Ctrl.clotureExercice)

// Plan comptable
router.get('/plan-comptable/:coproprieteId', requireAuth(), Ctrl.getPlanComptable)
router.post('/plan-comptable/initialiser', requireAuth(), Ctrl.initialiserPlanComptable)
router.post('/plan-comptable', requireAuth(), Ctrl.createCompte)
router.put('/plan-comptable/:id', requireAuth(), Ctrl.updateCompte)

// Journal, Grand Livre, Balance
router.get('/journal/:exerciceId', requireAuth(), Ctrl.getJournal)
router.get('/grand-livre/:exerciceId', requireAuth(), Ctrl.getGrandLivre)
router.get('/balance/:exerciceId', requireAuth(), Ctrl.getBalance)

// Ecritures
router.post('/ecriture', requireAuth(), Ctrl.createEcriture)
router.post('/generer-ecritures/:exerciceId', requireAuth(), Ctrl.genererEcritures)

// Annexes (loi ALUR)
router.get('/annexe1/:coproprieteId', requireAuth(), Ctrl.getAnnexe1)
router.get('/annexe2/:coproprieteId', requireAuth(), Ctrl.getAnnexe2)
router.get('/annexe3/:coproprieteId', requireAuth(), Ctrl.getAnnexe3)
router.get('/annexe4/:coproprieteId', requireAuth(), Ctrl.getAnnexe4)
router.get('/annexe5/:coproprieteId', requireAuth(), Ctrl.getAnnexe5)

export default router
