import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class RegularisationModel {
  static async getAllByCopropriete(coproprieteId) {
    const db = getDb()
    return db('regularisations')
      .where('copropriete_id', coproprieteId)
      .orderBy('annee', 'desc')
  }

  static async getById(id) {
    const db = getDb()
    const regularisation = await db('regularisations')
      .where('id', id)
      .first()
    if (!regularisation) return null
    const lignes = await db('regularisation_lignes')
      .where('regularisation_id', id)
      .join('lots', 'regularisation_lignes.lot_id', 'lots.id')
      .select('regularisation_lignes.*', 'lots.numero as lot_numero')
    return { ...regularisation, lignes }
  }

  /**
   * Persist a régularisation and its per-lot lignes in one transaction.
   * `header` holds the totals; `lignes` the per-lot rows.
   */
  static async create(header, lignes) {
    const db = getDb()
    return db.transaction(async trx => {
      const [reg] = await trx('regularisations')
        .insert(header)
        .returning('*')
      if (lignes.length) {
        await trx('regularisation_lignes').insert(
          lignes.map(l => ({ ...l, regularisation_id: reg.id }))
        )
      }
      return reg
    })
  }

  static async delete(id) {
    const db = getDb()
    return db('regularisations').where('id', id).del()
  }
}
