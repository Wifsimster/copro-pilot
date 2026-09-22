import { Router } from 'express'
import { TicketController } from '../controllers/TicketController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdminForDelete } from '../middleware/authorization.js'

const router = Router()

router.get('/', requireAuth(), TicketController.getAll)
router.get('/:id', requireAuth(), TicketController.getById)
router.post('/', requireAuth(), TicketController.create)
router.put('/:id', requireAuth(), TicketController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, TicketController.delete)
router.post('/:id/messages', requireAuth(), TicketController.addMessage)

export default router
