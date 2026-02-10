import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class PrestataireModel {
  static async getAll() {
    const db = getDb()
    return db('prestataires').orderBy('nom', 'asc')
  }

  static async getById(id) {
    const db = getDb()
    return db('prestataires').where('id', id).first()
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('prestataires')
      .insert({
        nom: data.nom,
        siret: data.siret || null,
        specialite: data.specialite || null,
        contact_nom: data.contact_nom || null,
        contact_email: data.contact_email || null,
        contact_telephone: data.contact_telephone || null,
        adresse: data.adresse || null,
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const [result] = await db('prestataires')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('prestataires').where('id', id).del()
  }
}
