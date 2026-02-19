import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class AuditLogModel {
  static async create(entry) {
    const db = getDb()
    const [result] = await db('audit_log')
      .insert({
        user_id: entry.user_id || null,
        action: entry.action,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id || null,
        description: entry.description || null,
        changes: entry.changes
          ? JSON.stringify(entry.changes)
          : null,
        ip_hash: entry.ip_hash || null,
      })
      .returning('*')
    return result
  }

  static async query({
    userId,
    action,
    entityType,
    from,
    to,
    page = 1,
    limit = 50,
  }) {
    const db = getDb()
    let query = db('audit_log').orderBy('created_at', 'desc')

    if (userId) query = query.where('user_id', userId)
    if (action) query = query.where('action', action)
    if (entityType) query = query.where('entity_type', entityType)
    if (from) query = query.where('created_at', '>=', from)
    if (to) query = query.where('created_at', '<=', to)

    const offset = (page - 1) * limit
    const countResult = await query
      .clone()
      .count('id as total')
      .first()
    const data = await query.offset(offset).limit(limit)

    const total = parseInt(countResult?.total || 0, 10)

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static async purgeOlderThan(date) {
    const db = getDb()
    return db('audit_log').where('created_at', '<', date).del()
  }
}
