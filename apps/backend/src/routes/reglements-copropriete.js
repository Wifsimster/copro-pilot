import { Router } from 'express'
import { ReglementCoproprieteController } from '../controllers/ReglementCoproprieteController.js'
import { ArticleReglementController } from '../controllers/ReglementCoproprieteController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

// Reglements
router.get('/copropriete/:coproprieteId', requireAuth(), ReglementCoproprieteController.getAllByCopropriete)
router.get('/:id', requireAuth(), ReglementCoproprieteController.getById)
router.post('/', requireAuth(), ReglementCoproprieteController.create)
router.put('/:id', requireAuth(), ReglementCoproprieteController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, ReglementCoproprieteController.delete)

// Articles
router.get('/:reglementId/articles', requireAuth(), ArticleReglementController.getAllByReglement)
router.get('/articles/:id', requireAuth(), ArticleReglementController.getById)
router.post('/articles', requireAuth(), ArticleReglementController.create)
router.put('/articles/:id', requireAuth(), ArticleReglementController.update)
router.delete('/articles/:id', requireAuth(), requireAdminForDelete, ArticleReglementController.delete)

export default router
