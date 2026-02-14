import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class CycleAnnuelModel {
  static async getAllByCopropriete(coproprieteId, annee) {
    const db = getDb()
    const query = db('cycle_annuel')
      .where('copropriete_id', coproprieteId)
      .orderBy('tache_code', 'asc')
    if (annee) query.where('annee', annee)
    return query
  }

  static async getById(id) {
    const db = getDb()
    return db('cycle_annuel').where('id', id).first()
  }

  static async getByCoproprieteAndCode(coproprieteId, annee, tacheCode) {
    const db = getDb()
    return db('cycle_annuel')
      .where({ copropriete_id: coproprieteId, annee, tache_code: tacheCode })
      .first()
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('cycle_annuel')
      .insert({
        copropriete_id: data.copropriete_id,
        annee: data.annee,
        tache_code: data.tache_code,
        tache_label: data.tache_label,
        statut: data.statut || 'pending',
        date_echeance: data.date_echeance || null,
        date_completion: data.date_completion || null,
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const [result] = await db('cycle_annuel')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('cycle_annuel').where('id', id).del()
  }

  static async upsert(coproprieteId, annee, tacheCode, data) {
    const existing = await CycleAnnuelModel.getByCoproprieteAndCode(
      coproprieteId,
      annee,
      tacheCode
    )
    if (existing) {
      return CycleAnnuelModel.update(existing.id, data)
    }
    return CycleAnnuelModel.create({
      copropriete_id: coproprieteId,
      annee,
      tache_code: tacheCode,
      ...data,
    })
  }

  static async getSummaryByCopropriete(coproprieteId, annee) {
    const db = getDb()
    const rows = await db('cycle_annuel')
      .where({ copropriete_id: coproprieteId, annee })
      .select('statut')
      .count('id as count')
      .groupBy('statut')
    const total = rows.reduce((sum, r) => sum + parseInt(r.count, 10), 0)
    const completed = rows
      .filter((r) => r.statut === 'completed')
      .reduce((sum, r) => sum + parseInt(r.count, 10), 0)
    return { total, completed, percentage: total ? Math.round((completed / total) * 100) : 0 }
  }
}
