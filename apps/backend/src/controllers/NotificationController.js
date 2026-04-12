import { notificationService } from '../services/NotificationService.js'
import logger from '../logger.js'

export class NotificationController {
    static async getAll(req, res) {
        try {
            const userId = req.user.id
            const notifications = await notificationService.getAllByUser(userId)
            res.json({ data: notifications })
        } catch (error) {
            logger.error(`[NotificationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de recuperer les notifications' })
        }
    }

    static async getUnreadCount(req, res) {
        try {
            const userId = req.user.id
            const count = await notificationService.getUnreadCountByUser(userId)
            res.json({ data: { count } })
        } catch (error) {
            logger.error(`[NotificationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de recuperer le compteur' })
        }
    }

    static async markAsRead(req, res) {
        try {
            const { id } = req.params
            const userId = req.user.id
            const result = await notificationService.markAsRead(id, userId)
            if (!result) return res.status(404).json({ error: 'Notification non trouvee' })
            res.json({ data: result, message: 'Notification marquee comme lue' })
        } catch (error) {
            logger.error(`[NotificationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de marquer comme lue' })
        }
    }

    static async markAllAsRead(req, res) {
        try {
            const userId = req.user.id
            await notificationService.markAllAsReadByUser(userId)
            res.json({ message: 'Toutes les notifications marquees comme lues' })
        } catch (error) {
            logger.error(`[NotificationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de marquer toutes comme lues' })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params
            const userId = req.user.id
            const deleted = await notificationService.delete(id, userId)
            if (!deleted) return res.status(404).json({ error: 'Notification non trouvee' })
            res.json({ message: 'Notification supprimee' })
        } catch (error) {
            logger.error(`[NotificationController] Error: ${error.message}`)
            res.status(500).json({ error: 'Impossible de supprimer la notification' })
        }
    }
}
