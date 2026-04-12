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
    let documents = []
    let incidents = []
    let presencesAg = []

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

      // Documents associated with the coproprietaire
      documents = await db('documents')
        .where('entite_type', 'coproprietaire')
        .where('entite_id', coproprietaire.id)
        .orderBy('created_at', 'desc')

      // Incidents reported by the coproprietaire
      incidents = await db('incidents')
        .select(
          'incidents.*',
          'coproprietes.nom as copropriete_nom'
        )
        .join(
          'coproprietes',
          'incidents.copropriete_id',
          'coproprietes.id'
        )
        .where('incidents.signale_par_id', coproprietaire.id)
        .orderBy('incidents.date_signalement', 'desc')

      // Assembly presences for the coproprietaire
      presencesAg = await db('presences_ag')
        .select(
          'presences_ag.*',
          'assemblees_generales.date as ag_date',
          'assemblees_generales.type as ag_type',
          'assemblees_generales.lieu as ag_lieu'
        )
        .join(
          'assemblees_generales',
          'presences_ag.ag_id',
          'assemblees_generales.id'
        )
        .where('presences_ag.coproprietaire_id', coproprietaire.id)
        .orderBy('assemblees_generales.date', 'desc')
    }

    const consents = await db('gdpr_consents')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')

    const notifications = await db('notifications')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')

    // Audit log entries for actions performed by the user
    const auditLog = await db('audit_log')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')

    return {
      user,
      coproprietaire: coproprietaire || null,
      lots,
      paiements,
      charges,
      documents,
      incidents,
      presences_ag: presencesAg,
      audit_log: auditLog,
      consents,
      notifications,
      exported_at: new Date().toISOString(),
    }
  }
}
