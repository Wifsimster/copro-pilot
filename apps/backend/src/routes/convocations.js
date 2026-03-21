import { Router } from 'express'
import { ConvocationAGController } from '../controllers/ConvocationAGController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'
import { requirePlan } from '../middleware/requirePlan.js'

const router = Router()

// Read — free for all plans
router.get('/ag/:agId', requireAuth(), ConvocationAGController.getByAgId)
router.get('/delai/:agId', requireAuth(), ConvocationAGController.verifierDelai)
router.get('/:id', requireAuth(), ConvocationAGController.getById)
router.get('/:id/destinataires', requireAuth(), ConvocationAGController.getDestinataires)

// Write & automation — requires Essentiel plan
router.post('/', requireAuth(), requirePlan('essentiel'), ConvocationAGController.create)
router.post('/destinataires', requireAuth(), requirePlan('essentiel'), ConvocationAGController.addDestinataire)
router.post('/:id/generer-destinataires', requireAuth(), requirePlan('essentiel'), ConvocationAGController.genererDestinataires)
router.post('/:id/envoyer', requireAuth(), requirePlan('essentiel'), ConvocationAGController.envoyer)
router.put('/:id', requireAuth(), requirePlan('essentiel'), ConvocationAGController.update)
router.put('/destinataires/:destId', requireAuth(), requirePlan('essentiel'), ConvocationAGController.updateDestinataire)
router.delete('/:id', requireAuth(), requirePlan('essentiel'), requireAdminForDelete, ConvocationAGController.delete)
router.delete('/destinataires/:destId', requireAuth(), requirePlan('essentiel'), requireAdminForDelete, ConvocationAGController.deleteDestinataire)

export default router
