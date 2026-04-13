import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ProcurationModel {
  static async getByAg(agId) {
    const db = getDb()
    return db('procurations')
      .select(
        'procurations.*',
        'm.nom as mandant_nom',
        'm.prenom as mandant_prenom',
        'p.nom as mandataire_nom',
        'p.prenom as mandataire_prenom'
      )
      .join('coproprietaires as m', 'procurations.mandant_id', 'm.id')
      .join('coproprietaires as p', 'procurations.mandataire_id', 'p.id')
      .where('procurations.ag_id', agId)
      .orderBy('procurations.date_signature', 'desc')
  }

  static async getById(id) {
    const db = getDb()
    return db('procurations').where('id', id).first()
  }

  static async getByMandataire(mandataireId, agId) {
    const db = getDb()
    return db('procurations')
      .select(
        'procurations.*',
        'm.nom as mandant_nom',
        'm.prenom as mandant_prenom'
      )
      .join('coproprietaires as m', 'procurations.mandant_id', 'm.id')
      .where('procurations.mandataire_id', mandataireId)
      .andWhere('procurations.ag_id', agId)
      .orderBy('procurations.date_signature', 'desc')
  }

  static async getActiveByMandant(mandantId, agId) {
    const db = getDb()
    return db('procurations')
      .where({
        mandant_id: mandantId,
        ag_id: agId,
        statut: 'active',
      })
      .first()
  }

  static async countActiveForMandataire(mandataireId, agId) {
    const db = getDb()
    const [{ count }] = await db('procurations')
      .where({
        mandataire_id: mandataireId,
        ag_id: agId,
        statut: 'active',
      })
      .count('id as count')
    return parseInt(count, 10) || 0
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('procurations')
      .insert({
        ag_id: data.ag_id,
        mandant_id: data.mandant_id,
        mandataire_id: data.mandataire_id,
        date_signature: data.date_signature || new Date(),
        statut: data.statut || 'active',
        signature_data: data.signature_data || null,
      })
      .returning('*')
    return result
  }

  static async revoke(id) {
    const db = getDb()
    const [result] = await db('procurations')
      .where('id', id)
      .update({
        statut: 'revoquee',
        updated_at: db.fn.now(),
      })
      .returning('*')
    return result
  }
}
