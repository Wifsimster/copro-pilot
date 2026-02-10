import { Router } from 'express'
import { NotificationController } from '../controllers/NotificationController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth(), NotificationController.getAll)
router.get('/unread-count', requireAuth(), NotificationController.getUnreadCount)
router.put('/read-all', requireAuth(), NotificationController.markAllAsRead)
router.put('/:id/read', requireAuth(), NotificationController.markAsRead)
router.delete('/:id', requireAuth(), NotificationController.delete)

export default router
