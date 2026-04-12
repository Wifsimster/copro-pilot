import { NotificationModel } from '../models/Notification.js'
import logger from '../logger.js'

class NotificationService {
    async getAllByUser(userId) {
        try {
            return await NotificationModel.getAllByUser(userId)
        } catch (error) {
            logger.error(`[NotificationService] Error getting notifications: ${error.message}`)
            throw error
        }
    }

    async getUnreadCountByUser(userId) {
        try {
            return await NotificationModel.getUnreadCountByUser(userId)
        } catch (error) {
            logger.error(`[NotificationService] Error getting unread count: ${error.message}`)
            throw error
        }
    }

    async create(data) {
        try {
            const result = await NotificationModel.create(data)
            logger.info(`[NotificationService] Notification created: ${result.titre} (ID: ${result.id})`)
            return result
        } catch (error) {
            logger.error(`[NotificationService] Error creating notification: ${error.message}`)
            throw error
        }
    }

    async markAsRead(id, userId) {
        try {
            const existing = await NotificationModel.getById(id)
            if (!existing) return null
            const result = await NotificationModel.markAsRead(id, userId)
            logger.info(`[NotificationService] Notification marked as read (ID: ${id})`)
            return result
        } catch (error) {
            logger.error(`[NotificationService] Error marking as read ${id}: ${error.message}`)
            throw error
        }
    }

    async markAllAsReadByUser(userId) {
        try {
            const count = await NotificationModel.markAllAsReadByUser(userId)
            logger.info(`[NotificationService] All notifications marked as read for user ${userId}`)
            return count
        } catch (error) {
            logger.error(`[NotificationService] Error marking all as read: ${error.message}`)
            throw error
        }
    }

    async delete(id, userId) {
        try {
            const existing = await NotificationModel.getById(id)
            if (!existing) return false
            await NotificationModel.delete(id, userId)
            logger.info(`[NotificationService] Notification deleted (ID: ${id})`)
            return true
        } catch (error) {
            logger.error(`[NotificationService] Error deleting notification ${id}: ${error.message}`)
            throw error
        }
    }
}

export const notificationService = new NotificationService()
