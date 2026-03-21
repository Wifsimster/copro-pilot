import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class DomainEventModel {
  static async create(data) {
    const db = getDb()
    const [result] = await db('domain_events')
      .insert({
        event_type: data.event_type,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        copropriete_id: data.copropriete_id || null,
        actor_id: data.actor_id || null,
        payload: data.payload || {},
        metadata: data.metadata || {},
      })
      .returning('*')
    return result
  }

  static async getByEntity(entityType, entityId) {
    const db = getDb()
    return db('domain_events')
      .where({ entity_type: entityType, entity_id: entityId })
      .orderBy('created_at', 'desc')
  }

  static async getByCopropriete(coproprieteId, options = {}) {
    const db = getDb()
    const { limit = 50, offset = 0, eventType } = options
    const query = db('domain_events')
      .where('copropriete_id', coproprieteId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)

    if (eventType) {
      query.andWhere('event_type', eventType)
    }

    return query
  }

  static async markProcessed(id) {
    const db = getDb()
    const [result] = await db('domain_events')
      .where('id', id)
      .update({ processed_at: db.fn.now() })
      .returning('*')
    return result
  }
}
