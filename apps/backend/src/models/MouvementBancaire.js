import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class MouvementBancaireModel {
  static async getAllByCompte(compteId) {
    const db = getDb()
    return db('mouvements_bancaires')
      .where('compte_id', compteId)
      .orderBy('date', 'desc')
  }

  static async getById(id) {
    const db = getDb()
    return db('mouvements_bancaires').where('id', id).first()
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('mouvements_bancaires')
      .insert({
        compte_id: data.compte_id,
        date: data.date,
        libelle: data.libelle,
        montant: data.montant,
        type: data.type,
        categorie: data.categorie || null,
        reference: data.reference || null,
        paiement_id: data.paiement_id || null,
        rapproche: data.rapproche || false,
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const [result] = await db('mouvements_bancaires')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('mouvements_bancaires').where('id', id).del()
  }

  static async getSoldeCompte(compteId) {
    const db = getDb()
    const credits = await db('mouvements_bancaires')
      .where({ compte_id: compteId, type: 'credit' })
      .sum('montant as total')
      .first()
    const debits = await db('mouvements_bancaires')
      .where({ compte_id: compteId, type: 'debit' })
      .sum('montant as total')
      .first()
    return {
      total_credits: parseFloat(credits?.total || 0),
      total_debits: parseFloat(debits?.total || 0),
      solde: parseFloat(credits?.total || 0) - parseFloat(debits?.total || 0),
    }
  }
}
