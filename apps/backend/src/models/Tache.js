import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class TacheModel {
  static async getAllByUser(userId, filters = {}) {
    const db = getDb()
    const query = db('taches')
      .where('user_id', userId)

    if (filters.statut) {
      query.where('statut', filters.statut)
    }
    if (filters.priorite) {
      query.where('priorite', filters.priorite)
    }
    if (filters.copropriete_id) {
      query.where('copropriete_id', filters.copropriete_id)
    }

    return query.orderBy('date_echeance', 'asc')
  }

  static async getAllByCopropriete(coproprieteId) {
    const db = getDb()
    return db('taches')
      .where('copropriete_id', coproprieteId)
      .orderBy('date_echeance', 'asc')
  }

  static async getById(id) {
    const db = getDb()
    return db('taches')
      .where('id', id)
      .first()
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('taches')
      .insert({
        user_id: data.user_id || null,
        copropriete_id: data.copropriete_id || null,
        titre: data.titre,
        description: data.description || null,
        date_echeance: data.date_echeance || null,
        rappel_date: data.rappel_date || null,
        entite_type: data.entite_type || null,
        entite_id: data.entite_id || null,
        statut: data.statut || 'a_faire',
        priorite: data.priorite || 'normale',
        auto_generated: data.auto_generated || false,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const allowedFields = [
      'user_id',
      'copropriete_id',
      'titre',
      'description',
      'date_echeance',
      'rappel_date',
      'entite_type',
      'entite_id',
      'statut',
      'priorite',
      'auto_generated',
    ]
    const updateData = {}
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
    }
    updateData.updated_at = db.fn.now()
    const [result] = await db('taches')
      .where('id', id)
      .update(updateData)
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('taches').where('id', id).del()
  }

  static async getOverdue() {
    const db = getDb()
    const today = new Date().toISOString().split('T')[0]
    return db('taches')
      .where('date_echeance', '<', today)
      .whereIn('statut', ['a_faire', 'en_cours'])
      .orderBy('date_echeance', 'asc')
  }

  static async getByEntity(entiteType, entiteId) {
    const db = getDb()
    return db('taches')
      .where('entite_type', entiteType)
      .where('entite_id', entiteId)
      .orderBy('created_at', 'desc')
  }
}
