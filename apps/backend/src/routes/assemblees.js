import { Router } from 'express'
import { AssembleeGeneraleController } from '../controllers/AssembleeGeneraleController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { requirePlan } from '../middleware/requirePlan.js'
import { validate } from '../middleware/validate.js'
import { assembleeSchema } from '../schemas/index.js'

const router = Router()

// Read — free for all plans
router.get('/copropriete/:coproprieteId', requireAuth(), AssembleeGeneraleController.getAllByCopropriete)
router.get('/:id', requireAuth(), AssembleeGeneraleController.getById)
router.get('/:id/resolutions', requireAuth(), AssembleeGeneraleController.getResolutions)
router.get('/:id/presences', requireAuth(), AssembleeGeneraleController.getPresences)

// Write & automation — requires Essentiel plan
router.post('/:id/generer-pv', requireAuth(), requirePlan('essentiel'), AssembleeGeneraleController.genererPv)
router.post('/', requireAuth(), requirePlan('essentiel'), validate(assembleeSchema), AssembleeGeneraleController.create)
router.post('/resolutions', requireAuth(), requirePlan('essentiel'), AssembleeGeneraleController.createResolution)
router.post('/presences', requireAuth(), requirePlan('essentiel'), AssembleeGeneraleController.setPresence)
router.put('/:id', requireAuth(), requirePlan('essentiel'), validate(assembleeSchema), AssembleeGeneraleController.update)
router.put('/resolutions/:resolutionId', requireAuth(), requirePlan('essentiel'), AssembleeGeneraleController.updateResolution)
router.delete('/:id', requireAuth(), requirePlan('essentiel'), requireAdminForDelete, AssembleeGeneraleController.delete)
router.delete('/presences/:presenceId', requireAuth(), requirePlan('essentiel'), requireAdminForDelete, AssembleeGeneraleController.deletePresence)
router.delete('/resolutions/:resolutionId', requireAuth(), requirePlan('essentiel'), requireAdminForDelete, AssembleeGeneraleController.deleteResolution)

export default router
