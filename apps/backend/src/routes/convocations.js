import { Router } from 'express'
import { ConvocationAGController } from '../controllers/ConvocationAGController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/ag/:agId', requireAuth(), ConvocationAGController.getByAgId)
router.get('/delai/:agId', requireAuth(), ConvocationAGController.verifierDelai)
router.get('/:id', requireAuth(), ConvocationAGController.getById)
router.get('/:id/destinataires', requireAuth(), ConvocationAGController.getDestinataires)
router.post('/', requireAuth(), ConvocationAGController.create)
router.post('/destinataires', requireAuth(), ConvocationAGController.addDestinataire)
router.post('/:id/generer-destinataires', requireAuth(), ConvocationAGController.genererDestinataires)
router.post('/:id/envoyer', requireAuth(), ConvocationAGController.envoyer)
router.put('/:id', requireAuth(), ConvocationAGController.update)
router.put('/destinataires/:destId', requireAuth(), ConvocationAGController.updateDestinataire)
router.delete('/:id', requireAuth(), ConvocationAGController.delete)
router.delete('/destinataires/:destId', requireAuth(), ConvocationAGController.deleteDestinataire)

export default router
