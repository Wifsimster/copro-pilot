import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class CompteBancaireModel {
  static async getAllByCopropriete(coproprieteId) {
    const db = getDb()
    return db('comptes_bancaires')
      .where('copropriete_id', coproprieteId)
      .orderBy('type', 'asc')
  }

  static async getById(id) {
    const db = getDb()
    return db('comptes_bancaires').where('id', id).first()
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('comptes_bancaires')
      .insert({
        copropriete_id: data.copropriete_id,
        banque: data.banque,
        iban: data.iban,
        bic: data.bic || null,
        type: data.type || 'courant',
        libelle: data.libelle || null,
        solde: data.solde || 0,
        date_ouverture: data.date_ouverture || null,
        actif: data.actif !== undefined ? data.actif : true,
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const [result] = await db('comptes_bancaires')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('comptes_bancaires').where('id', id).del()
  }

  static async getSoldeTotal(coproprieteId) {
    const db = getDb()
    const result = await db('comptes_bancaires')
      .where({ copropriete_id: coproprieteId, actif: true })
      .sum('solde as total')
      .first()
    return parseFloat(result?.total || 0)
  }
}
