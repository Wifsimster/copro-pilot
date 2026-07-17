import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class SoldeInitialModel {
  static async getByCoproAnnee(coproprieteId, annee) {
    const db = getDb()
    return db('soldes_initiaux')
      .where({ copropriete_id: coproprieteId, annee })
      .join(
        'coproprietaires',
        'soldes_initiaux.coproprietaire_id',
        'coproprietaires.id'
      )
      .select(
        'soldes_initiaux.*',
        'coproprietaires.nom as coproprietaire_nom',
        'coproprietaires.prenom as coproprietaire_prenom'
      )
  }

  /**
   * Upsert the opening balances for a copro/année in one statement, so
   * re-saving updates rather than duplicating (idempotent).
   */
  static async bulkUpsert(coproprieteId, annee, soldes) {
    const db = getDb()
    if (!soldes.length) return []
    const rows = soldes.map(s => ({
      copropriete_id: coproprieteId,
      coproprietaire_id: s.coproprietaire_id,
      annee,
      montant: s.montant,
    }))
    return db('soldes_initiaux')
      .insert(rows)
      .onConflict(['copropriete_id', 'coproprietaire_id', 'annee'])
      .merge(['montant', 'updated_at'])
      .returning('*')
  }
}
