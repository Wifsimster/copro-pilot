import { Router } from 'express'
import { AppelFondsController } from '../controllers/AppelFondsController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), AppelFondsController.getAllByCopropriete)
router.get('/:id', requireAuth(), AppelFondsController.getById)
router.get('/:id/lignes', requireAuth(), AppelFondsController.getLignes)
router.post('/', requireAuth(), AppelFondsController.create)
router.post('/lignes', requireAuth(), AppelFondsController.createLigne)
router.put('/lignes/:ligneId', requireAuth(), AppelFondsController.updateLigne)
router.put('/:id', requireAuth(), AppelFondsController.update)
router.post('/generate-from-budget/:budgetId', requireAuth(), AppelFondsController.generateFromBudget)
router.delete('/lignes/:ligneId', requireAuth(), AppelFondsController.deleteLigne)
router.delete('/:id', requireAuth(), AppelFondsController.delete)

export default router
