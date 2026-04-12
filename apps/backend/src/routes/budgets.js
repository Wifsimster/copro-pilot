import { Router } from 'express'
import { BudgetController } from '../controllers/BudgetController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { validate } from '../middleware/validate.js'
import { budgetSchema } from '../schemas/index.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), BudgetController.getAllByCopropriete)
router.get('/:id', requireAuth(), BudgetController.getById)
router.get('/:id/postes', requireAuth(), BudgetController.getPostes)
router.post('/', requireAuth(), validate(budgetSchema), BudgetController.create)
router.post('/postes', requireAuth(), BudgetController.createPoste)
router.put('/:id', requireAuth(), validate(budgetSchema), BudgetController.update)
router.put('/postes/:posteId', requireAuth(), BudgetController.updatePoste)
router.delete('/:id', requireAuth(), requireAdminForDelete, BudgetController.delete)
router.delete('/postes/:posteId', requireAuth(), requireAdminForDelete, BudgetController.deletePoste)

export default router
