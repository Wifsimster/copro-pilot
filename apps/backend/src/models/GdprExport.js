import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class GdprExportModel {
  static async getUserData(userId) {
    const db = getDb()

    const user = await db('user')
      .select('id', 'name', 'email', 'role', 'createdAt', 'updatedAt')
      .where('id', userId)
      .first()

    const coproprietaire = await db('coproprietaires')
      .where('user_id', userId)
      .first()

    let lots = []
    let paiements = []
    let charges = []

    if (coproprietaire) {
      lots = await db('lots')
        .select(
          'lots.*',
          'coproprietes.nom as copropriete_nom'
        )
        .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
        .where('lots.coproprietaire_id', coproprietaire.id)

      paiements = await db('paiements')
        .where('coproprietaire_id', coproprietaire.id)
        .orderBy('date_paiement', 'desc')

      charges = await db('appels_fonds_lignes')
        .select(
          'appels_fonds_lignes.*',
          'appels_fonds.trimestre',
          'appels_fonds.annee'
        )
        .join(
          'appels_fonds',
          'appels_fonds_lignes.appel_fonds_id',
          'appels_fonds.id'
        )
        .where('appels_fonds_lignes.coproprietaire_id', coproprietaire.id)
    }

    const consents = await db('gdpr_consents')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')

    const notifications = await db('notifications')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')

    return {
      user,
      coproprietaire: coproprietaire || null,
      lots,
      paiements,
      charges,
      consents,
      notifications,
      exported_at: new Date().toISOString(),
    }
  }
}
