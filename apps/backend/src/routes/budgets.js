import { Router } from 'express'
import { BudgetController } from '../controllers/BudgetController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), BudgetController.getAllByCopropriete)
router.get('/:id', requireAuth(), BudgetController.getById)
router.get('/:id/postes', requireAuth(), BudgetController.getPostes)
router.post('/', requireAuth(), BudgetController.create)
router.post('/postes', requireAuth(), BudgetController.createPoste)
router.put('/:id', requireAuth(), BudgetController.update)
router.put('/postes/:posteId', requireAuth(), BudgetController.updatePoste)
router.delete('/:id', requireAuth(), BudgetController.delete)
router.delete('/postes/:posteId', requireAuth(), BudgetController.deletePoste)

export default router
