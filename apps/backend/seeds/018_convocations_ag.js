/**
 * Seed: convocations_ag, destinataires_convocation
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('convocations_ag').count('id as cnt').first()
  if (existing.cnt > 0) return

  const now = new Date()
  const ags = await knex('assemblees_generales').select('*').orderBy('id')
  if (ags.length === 0) return

  const convocData = []
  for (const ag of ags) {
    if (ag.statut === 'terminee') {
      convocData.push({
        ag_id: ag.id,
        date_envoi: ag.date_convocation || '2025-05-15',
        mode_envoi: 'les_deux',
        statut: 'envoyee',
        contenu: `Madame, Monsieur,\n\nNous avons l'honneur de vous convoquer à l'Assemblée Générale ${ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'} de votre copropriété qui se tiendra :\n\nDate : ${ag.date}\nHeure : ${ag.heure || '18:00'}\nLieu : ${ag.lieu || 'À définir'}\n\nOrdre du jour :\n${ag.ordre_du_jour || 'Voir document joint'}\n\nConformément à l'article 9 du décret du 17 mars 1967, nous vous rappelons que vous disposez de la possibilité de vous faire représenter par un mandataire de votre choix.\n\nVeuillez trouver ci-joints les documents préparatoires à cette assemblée.\n\nNous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.\n\nLe Syndic`,
        documents_annexes: JSON.stringify(['Budget prévisionnel', 'Comptes annuels', 'Devis travaux']),
        notes: 'Convocation envoyée dans les délais légaux',
        created_at: now,
        updated_at: now,
      })
    } else {
      convocData.push({
        ag_id: ag.id,
        date_envoi: null,
        mode_envoi: 'email',
        statut: 'brouillon',
        contenu: `Madame, Monsieur,\n\nNous avons l'honneur de vous convoquer à l'Assemblée Générale ${ag.type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'} de votre copropriété qui se tiendra :\n\nDate : ${ag.date}\nHeure : ${ag.heure || '18:00'}\nLieu : ${ag.lieu || 'À définir'}\n\nOrdre du jour :\n${ag.ordre_du_jour || 'À compléter'}\n\nConformément à l'article 9 du décret du 17 mars 1967, nous vous rappelons que vous disposez de la possibilité de vous faire représenter par un mandataire de votre choix.\n\nVeuillez trouver ci-joints les documents préparatoires à cette assemblée.\n\nNous vous prions d'agréer, Madame, Monsieur, l'expression de nos salutations distinguées.\n\nLe Syndic`,
        documents_annexes: null,
        notes: null,
        created_at: now,
        updated_at: now,
      })
    }
  }

  const insertedConvocs = await knex('convocations_ag').insert(convocData).returning(['id', 'ag_id', 'statut', 'date_envoi', 'mode_envoi'])

  // Get lots with coproprietaires for destinataires
  const lots = await knex('lots')
    .select('lots.coproprietaire_id', 'lots.copropriete_id', 'coproprietaires.email')
    .join('coproprietaires', 'lots.coproprietaire_id', 'coproprietaires.id')
    .whereNotNull('lots.coproprietaire_id')
    .groupBy('lots.coproprietaire_id', 'lots.copropriete_id', 'coproprietaires.email')

  // Group by copropriete
  const coprosByCopropriete = {}
  for (const lot of lots) {
    if (!coprosByCopropriete[lot.copropriete_id]) {
      coprosByCopropriete[lot.copropriete_id] = []
    }
    // Avoid duplicates
    if (!coprosByCopropriete[lot.copropriete_id].find(c => c.coproprietaire_id === lot.coproprietaire_id)) {
      coprosByCopropriete[lot.copropriete_id].push({
        coproprietaire_id: lot.coproprietaire_id,
        email: lot.email,
      })
    }
  }

  // Get AG -> copropriete mapping
  const agMap = {}
  for (const ag of ags) {
    agMap[ag.id] = ag
  }

  const destData = []
  for (const convoc of insertedConvocs) {
    const ag = agMap[convoc.ag_id]
    if (!ag) continue
    const copros = coprosByCopropriete[ag.copropriete_id] || []

    for (let j = 0; j < copros.length; j++) {
      const c = copros[j]
      if (convoc.statut === 'envoyee') {
        const statuts = ['envoyee', 'recue', 'ar_signe', 'recue', 'ar_signe']
        const statut = statuts[j % statuts.length]
        destData.push({
          convocation_id: convoc.id,
          coproprietaire_id: c.coproprietaire_id,
          statut,
          date_envoi: convoc.date_envoi,
          date_reception: statut !== 'envoyee' ? '2025-05-20' : null,
          date_ar: statut === 'ar_signe' ? '2025-05-25' : null,
          mode_envoi: j % 2 === 0 ? 'email' : 'courrier_recommande',
          email_envoye_a: c.email || null,
          notes: null,
          created_at: now,
          updated_at: now,
        })
      } else {
        destData.push({
          convocation_id: convoc.id,
          coproprietaire_id: c.coproprietaire_id,
          statut: 'en_attente',
          date_envoi: null,
          date_reception: null,
          date_ar: null,
          mode_envoi: null,
          email_envoye_a: c.email || null,
          notes: null,
          created_at: now,
          updated_at: now,
        })
      }
    }
  }

  // Insert in batches of 500 to avoid query size limits
  const BATCH_SIZE = 500
  for (let i = 0; i < destData.length; i += BATCH_SIZE) {
    await knex('destinataires_convocation').insert(destData.slice(i, i + BATCH_SIZE))
  }
}
