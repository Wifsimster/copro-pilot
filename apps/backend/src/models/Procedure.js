import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ProcedureModel {
  static async getAllByCopropriete(coproprieteId) {
    const db = getDb()
    return db('procedures')
      .select(
        'procedures.*',
        'coproprietaires.nom as coproprietaire_nom',
        'coproprietaires.prenom as coproprietaire_prenom'
      )
      .leftJoin('coproprietaires', 'procedures.coproprietaire_id', 'coproprietaires.id')
      .where('procedures.copropriete_id', coproprieteId)
      .orderBy('procedures.created_at', 'desc')
  }

  static async getById(id) {
    const db = getDb()
    return db('procedures')
      .select(
        'procedures.*',
        'coproprietaires.nom as coproprietaire_nom',
        'coproprietaires.prenom as coproprietaire_prenom'
      )
      .leftJoin('coproprietaires', 'procedures.coproprietaire_id', 'coproprietaires.id')
      .where('procedures.id', id)
      .first()
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('procedures')
      .insert({
        copropriete_id: data.copropriete_id,
        coproprietaire_id: data.coproprietaire_id,
        avocat: data.avocat || null,
        tribunal: data.tribunal || null,
        reference_dossier: data.reference_dossier || null,
        date_assignation: data.date_assignation || null,
        date_audience: data.date_audience || null,
        date_jugement: data.date_jugement || null,
        montant_reclame: data.montant_reclame || null,
        montant_obtenu: data.montant_obtenu || null,
        frais_procedure: data.frais_procedure || null,
        statut: data.statut || 'en_cours',
        decision: data.decision || null,
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const [result] = await db('procedures')
      .where('id', id)
      .update({
        ...data,
        updated_at: db.fn.now(),
      })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('procedures').where('id', id).del()
  }
}
