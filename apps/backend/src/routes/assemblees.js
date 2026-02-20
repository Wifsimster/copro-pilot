import { Router } from 'express'
import { AssembleeGeneraleController } from '../controllers/AssembleeGeneraleController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/copropriete/:coproprieteId', requireAuth(), AssembleeGeneraleController.getAllByCopropriete)
router.get('/:id', requireAuth(), AssembleeGeneraleController.getById)
router.get('/:id/resolutions', requireAuth(), AssembleeGeneraleController.getResolutions)
router.get('/:id/presences', requireAuth(), AssembleeGeneraleController.getPresences)
router.post('/:id/generer-pv', requireAuth(), AssembleeGeneraleController.genererPv)
router.post('/', requireAuth(), AssembleeGeneraleController.create)
router.post('/resolutions', requireAuth(), AssembleeGeneraleController.createResolution)
router.post('/presences', requireAuth(), AssembleeGeneraleController.setPresence)
router.put('/:id', requireAuth(), AssembleeGeneraleController.update)
router.put('/resolutions/:resolutionId', requireAuth(), AssembleeGeneraleController.updateResolution)
router.delete('/:id', requireAuth(), requireAdminForDelete, AssembleeGeneraleController.delete)
router.delete('/presences/:presenceId', requireAuth(), requireAdminForDelete, AssembleeGeneraleController.deletePresence)
router.delete('/resolutions/:resolutionId', requireAuth(), requireAdminForDelete, AssembleeGeneraleController.deleteResolution)

export default router
