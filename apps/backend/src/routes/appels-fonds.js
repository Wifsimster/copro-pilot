import { Router } from 'express'
import { AppelFondsController } from '../controllers/AppelFondsController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), AppelFondsController.getAllByCopropriete)
router.get('/:id', requireAuth(), AppelFondsController.getById)
router.get('/:id/lignes', requireAuth(), AppelFondsController.getLignes)
router.post('/', requireAuth(), AppelFondsController.create)
router.post('/lignes', requireAuth(), AppelFondsController.createLigne)
router.put('/:id', requireAuth(), AppelFondsController.update)
router.delete('/:id', requireAuth(), AppelFondsController.delete)

export default router
