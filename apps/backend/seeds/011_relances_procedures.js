/**
 * Seed: relances & procedures contentieuses
 * Creates debt collection reminders and legal procedures
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('procedures').del()
  await knex('relances').del()

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Get coproprietaires via lots to know who belongs to which copropriete
  const lots = await knex('lots')
    .select('copropriete_id', 'coproprietaire_id')
    .whereNotNull('coproprietaire_id')
  const coproprietairesByCopro = {}
  for (const lot of lots) {
    if (!coproprietairesByCopro[lot.copropriete_id])
      coproprietairesByCopro[lot.copropriete_id] = new Set()
    coproprietairesByCopro[lot.copropriete_id].add(lot.coproprietaire_id)
  }

  const RELANCE_TYPES = ['amiable', 'mise_en_demeure', 'contentieux']

  const MODES_ENVOI = [
    'email',
    'courrier_simple',
    'lettre_recommandee_ar',
    'huissier',
  ]

  const RELANCE_STATUTS = ['brouillon', 'envoyee', 'accusee_reception', 'sans_effet']

  const RELANCE_MONTANTS = [450.00, 1200.00, 2850.00, 780.00, 3400.00, 1650.00, 920.00, 5200.00]

  const RELANCE_NOTES = [
    'Premiere relance amiable pour charges du T3 2025 impayees.',
    'Mise en demeure envoyee par lettre recommandee. Delai de 30 jours accorde.',
    'Relance restee sans effet. Transmission du dossier au contentieux.',
    'Rappel courtois avant engagement de procedure.',
    'Mise en demeure avec calcul des interets de retard au taux legal.',
    'Deuxieme relance amiable. Le coproprietaire a promis un reglement sous quinzaine.',
    'Lettre recommandee avec AR revenue signee. Delai de paiement expire.',
    'Relance pour charges de copropriete et provisions sur travaux impayees.',
    'Mise en demeure formelle precedant la saisine du tribunal.',
    'Relance amiable suite a l\'echeancier de paiement non respecte.',
  ]

  const AVOCATS = [
    'Cabinet Duval & Associes',
    'Me Sophie Martin',
    'Cabinet Lefebvre Avocats',
    'Me Jean-Pierre Moreau',
    'Cabinet Bernard & Rousseau',
    'Me Catherine Petit',
  ]

  const TRIBUNAUX = [
    'Tribunal judiciaire de Paris',
    'Tribunal judiciaire de Lyon',
    'Tribunal de proximite de Versailles',
    'Tribunal judiciaire de Marseille',
    'Tribunal judiciaire de Nanterre',
    'Tribunal de proximite de Bobigny',
  ]

  const PROCEDURE_STATUTS = ['en_preparation', 'en_cours', 'audience_fixee', 'juge', 'execute', 'clos']

  const PROCEDURE_DECISIONS = [
    'Condamnation au paiement des charges impayees majorees des interets de retard et des frais de procedure.',
    'Jugement ordonnant le paiement de la somme reclamee avec execution provisoire.',
    'Decision favorable au syndicat. Condamnation aux depens et a l\'article 700.',
    'Jugement mixte : condamnation partielle avec echeancier impose par le tribunal.',
  ]

  const PROCEDURE_NOTES = [
    'Dossier transmis a l\'avocat du syndicat. Constitution du dossier en cours.',
    'Assignation delivree par huissier. Audience prevue dans les 3 mois.',
    'Procedure en cours. Le defendeur n\'a pas constitue avocat.',
    'Jugement rendu. Signification en cours par huissier.',
    'Titre executoire obtenu. Saisie sur compte bancaire en cours.',
    'Procedure cloturee. Recouvrement integral des sommes dues.',
    'Audience renvoyee a la demande du defendeur. Nouvelle date fixee.',
    'Dossier en preparation. Decompte des charges avec interets en cours de calcul.',
  ]

  const relanceData = []
  const procedureData = []

  for (let idx = 0; idx < coproIds.length; idx++) {
    const coproId = coproIds[idx]
    const coproprietaires = coproprietairesByCopro[coproId]
      ? Array.from(coproprietairesByCopro[coproId])
      : []
    if (coproprietaires.length === 0) continue

    // Each copro has 2-3 relances
    const nbRelances = idx % 2 === 0 ? 3 : 2

    for (let i = 0; i < nbRelances; i++) {
      const coproprietaireId = coproprietaires[(idx + i) % coproprietaires.length]
      const type = RELANCE_TYPES[i % RELANCE_TYPES.length]

      // Mode envoi escalates with type
      let modeEnvoi
      if (type === 'amiable') modeEnvoi = MODES_ENVOI[idx % 2] // email or courrier_simple
      else if (type === 'mise_en_demeure') modeEnvoi = 'lettre_recommandee_ar'
      else modeEnvoi = 'huissier'

      // Statut depends on the scenario
      let statut
      if (i === 0) statut = RELANCE_STATUTS[(idx + 1) % 3 + 1] // envoyee, accusee_reception, or sans_effet
      else if (i === 1) statut = idx % 2 === 0 ? 'sans_effet' : 'accusee_reception'
      else statut = 'sans_effet' // third relance is always sans_effet to justify procedure

      const dateRelance = new Date(2025, 5 + i * 2 + (idx % 3), ((idx + i * 5) % 28) + 1)

      relanceData.push({
        copropriete_id: coproId,
        coproprietaire_id: coproprietaireId,
        type,
        date_relance: dateRelance.toISOString().split('T')[0],
        montant_du: RELANCE_MONTANTS[(idx * 3 + i) % RELANCE_MONTANTS.length],
        mode_envoi: modeEnvoi,
        statut,
        notes: RELANCE_NOTES[(idx + i) % RELANCE_NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }

    // Procedures: only for copros where last relance is 'sans_effet' (every other copro with 3 relances)
    const hasContentieux = idx % 2 === 0 // copros with 3 relances always have a sans_effet
    if (hasContentieux) {
      // Use same coproprietaire as the contentieux relance
      const coproprietaireId = coproprietaires[(idx + 2) % coproprietaires.length]
      const montantRelance = RELANCE_MONTANTS[(idx * 3 + 2) % RELANCE_MONTANTS.length]
      const montantReclame = Math.round((montantRelance * 1.15) * 100) / 100 // +15% interests
      const statut = PROCEDURE_STATUTS[(idx / 2) % PROCEDURE_STATUTS.length]

      const dateAssignation = new Date(2025, 10 + (idx % 2), ((idx * 3) % 28) + 1)
      const dateAudience = statut !== 'en_preparation'
        ? new Date(2026, 1 + (idx % 3), ((idx * 5) % 28) + 1)
        : null
      const dateJugement = ['juge', 'execute', 'clos'].includes(statut)
        ? new Date(2026, 3 + (idx % 2), ((idx * 7) % 28) + 1)
        : null

      const montantObtenu = ['juge', 'execute', 'clos'].includes(statut)
        ? Math.round(montantReclame * 0.9 * 100) / 100
        : null

      const fraisProcedure = [800.00, 1200.00, 1500.00, 2200.00, 2800.00, 3000.00]

      procedureData.push({
        copropriete_id: coproId,
        coproprietaire_id: coproprietaireId,
        avocat: AVOCATS[(idx / 2) % AVOCATS.length],
        tribunal: TRIBUNAUX[(idx / 2) % TRIBUNAUX.length],
        reference_dossier: `CONT-2025-${String(Math.floor(idx / 2) + 1).padStart(3, '0')}`,
        date_assignation: dateAssignation.toISOString().split('T')[0],
        date_audience: dateAudience ? dateAudience.toISOString().split('T')[0] : null,
        date_jugement: dateJugement ? dateJugement.toISOString().split('T')[0] : null,
        montant_reclame: montantReclame,
        montant_obtenu: montantObtenu,
        frais_procedure: fraisProcedure[(idx / 2) % fraisProcedure.length],
        statut,
        decision: ['juge', 'execute', 'clos'].includes(statut)
          ? PROCEDURE_DECISIONS[(idx / 2) % PROCEDURE_DECISIONS.length]
          : null,
        notes: PROCEDURE_NOTES[(idx / 2) % PROCEDURE_NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }
  }

  if (relanceData.length > 0) {
    await knex('relances').insert(relanceData)
  }

  if (procedureData.length > 0) {
    await knex('procedures').insert(procedureData)
  }
}
