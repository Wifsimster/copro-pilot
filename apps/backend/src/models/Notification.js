import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class NotificationModel {
    static async getAllByUser(userId) {
        const db = getDb()
        return db('notifications')
            .where('user_id', userId)
            .orderBy('created_at', 'desc')
    }

    static async getUnreadCountByUser(userId) {
        const db = getDb()
        const result = await db('notifications')
            .where({ user_id: userId, lu: false })
            .count('id as count')
            .first()
        return parseInt(result.count, 10)
    }

    static async getById(id) {
        const db = getDb()
        return db('notifications').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('notifications')
            .insert({
                user_id: data.user_id,
                copropriete_id: data.copropriete_id || null,
                type: data.type || 'general',
                titre: data.titre,
                message: data.message || null,
                lu: data.lu || false,
                lien: data.lien || null,
            })
            .returning('*')
        return result
    }

    static async markAsRead(id) {
        const db = getDb()
        const [result] = await db('notifications')
            .where('id', id)
            .update({ lu: true, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async markAllAsReadByUser(userId) {
        const db = getDb()
        return db('notifications')
            .where({ user_id: userId, lu: false })
            .update({ lu: true, updated_at: db.fn.now() })
    }

    static async delete(id) {
        const db = getDb()
        return db('notifications').where('id', id).del()
    }
}
