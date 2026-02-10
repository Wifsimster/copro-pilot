/**
 * Seed: conseil_syndical
 * Creates conseil syndical members for each copropriete with realistic variety
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Always recreate for fresh data
  await knex('conseil_syndical').del()

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Get lots with coproprietaire assignments per copropriete
  const lots = await knex('lots')
    .select('copropriete_id', 'coproprietaire_id')
    .whereNotNull('coproprietaire_id')
    .orderBy('id')

  // Group coproprietaire_ids by copropriete (deduplicate)
  const coproprietairesByCopro = {}
  for (const lot of lots) {
    if (!coproprietairesByCopro[lot.copropriete_id]) {
      coproprietairesByCopro[lot.copropriete_id] = new Set()
    }
    coproprietairesByCopro[lot.copropriete_id].add(lot.coproprietaire_id)
  }

  // Get assemblees for AG election references
  const allAGs = await knex('assemblees_generales')
    .select('id', 'copropriete_id', 'statut', 'date')
    .orderBy('date', 'asc')

  // Group AGs by copropriete, keep terminated ones for past elections
  const agsByCopro = {}
  for (const ag of allAGs) {
    if (!agsByCopro[ag.copropriete_id]) agsByCopro[ag.copropriete_id] = []
    agsByCopro[ag.copropriete_id].push(ag)
  }

  // Different election dates per copropriete for variety
  const ELECTION_CONFIGS = [
    { date: '2025-06-15', fin: '2028-06-15', label: 'AG ordinaire juin 2025' },
    { date: '2024-11-20', fin: '2027-11-20', label: 'AG ordinaire novembre 2024' },
    { date: '2025-03-10', fin: '2028-03-10', label: 'AG ordinaire mars 2025' },
    { date: '2024-06-22', fin: '2027-06-22', label: 'AG ordinaire juin 2024' },
    { date: '2025-09-18', fin: '2028-09-18', label: 'AG ordinaire septembre 2025' },
  ]

  // Rich, varied notes
  const PRESIDENT_NOTES = [
    'Élu à l\'unanimité. Prend en charge la coordination avec le syndic.',
    'Réélue pour un second mandat. Expérience reconnue en gestion immobilière.',
    'Premier mandat. Ancien expert-comptable, apporte ses compétences financières.',
    'Élue avec 85% des voix. Très impliquée dans le suivi des travaux.',
    'Réélu après interruption d\'un mandat. Connaissance approfondie de la copropriété.',
  ]

  const MEMBRE_NOTES = [
    'Référent travaux et entretien. Suit les devis et la réalisation des interventions.',
    'Spécialiste des questions juridiques. Avocate de profession.',
    'En charge du suivi financier et du contrôle des comptes du syndic.',
    'Membre actif, participe à toutes les réunions du conseil.',
    'Référente assurances. Vérifie les contrats et garanties.',
    'Suit les questions de sécurité (incendie, ascenseurs, portails).',
    'En charge de la communication avec les copropriétaires.',
    'Ingénieur bâtiment, référent technique pour les diagnostics.',
    'Responsable du suivi du carnet d\'entretien.',
    'Architecte de profession, consulté sur les projets de rénovation.',
    'Coordinateur des relations avec les prestataires.',
    'Comptable, assure le suivi budgétaire trimestriel.',
  ]

  const SUPPLEANT_NOTES = [
    'Suppléant disponible en cas d\'absence d\'un membre titulaire.',
    'Nouveau copropriétaire, souhaite s\'impliquer progressivement.',
    'Participe aux réunions en tant qu\'observateur avant titularisation.',
    'Ancien membre titulaire, reste disponible en suppléance.',
    'Suppléante motivée, suit les dossiers en cours.',
  ]

  const ANCIEN_NOTES = [
    'Ancien membre, mandat non renouvelé. A assuré le suivi des travaux de ravalement.',
    'Mandat arrivé à échéance. N\'a pas souhaité se représenter pour raisons personnelles.',
    'Ancien président, a cédé sa place après deux mandats consécutifs.',
    'Mandat échu. Déménagement prévu, a préféré laisser la place.',
    'Ancienne membre, a contribué à la mise en place du fonds travaux.',
  ]

  const EXPIRE_BIENTOT_NOTES = [
    'Mandat arrivant à échéance. Renouvellement à l\'ordre du jour de la prochaine AG.',
    'Fin de mandat imminente. Souhaite se représenter.',
    'Mandat expirant prochainement. Bilan à présenter en AG.',
  ]

  const conseilData = []

  for (let idx = 0; idx < coproIds.length; idx++) {
    const coproId = coproIds[idx]
    const coproprietaireIds = coproprietairesByCopro[coproId]
    if (!coproprietaireIds || coproprietaireIds.size < 3) continue

    const ids = Array.from(coproprietaireIds)
    const config = ELECTION_CONFIGS[idx % ELECTION_CONFIGS.length]
    const ags = agsByCopro[coproId] || []
    const pastAG = ags.find((ag) => ag.statut === 'terminee')
    const agId = pastAG ? pastAG.id : null

    let memberIdx = 0

    // 1 président
    conseilData.push({
      copropriete_id: coproId,
      coproprietaire_id: ids[memberIdx++],
      role: 'president',
      date_election: config.date,
      date_fin_mandat: config.fin,
      ag_election_id: agId,
      notes: PRESIDENT_NOTES[idx % PRESIDENT_NOTES.length],
      created_at: now,
      updated_at: now,
    })

    // 3 à 4 membres titulaires (varie par copro)
    const nbMembres = idx % 2 === 0 ? 3 : 4
    for (let i = 0; i < nbMembres && memberIdx < ids.length; i++) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[memberIdx++],
        role: 'membre',
        date_election: config.date,
        date_fin_mandat: config.fin,
        ag_election_id: agId,
        notes: MEMBRE_NOTES[(idx * 3 + i) % MEMBRE_NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }

    // 1 à 2 suppléants (varie par copro)
    const nbSuppleants = idx % 3 === 0 ? 2 : 1
    for (let i = 0; i < nbSuppleants && memberIdx < ids.length; i++) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[memberIdx++],
        role: 'suppleant',
        date_election: config.date,
        date_fin_mandat: config.fin,
        ag_election_id: agId,
        notes: SUPPLEANT_NOTES[(idx + i) % SUPPLEANT_NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }

    // 1 ancien membre (mandat expiré) — élu lors d'un mandat précédent
    if (memberIdx < ids.length) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[memberIdx++],
        role: 'membre',
        date_election: '2021-06-12',
        date_fin_mandat: '2024-06-12',
        ag_election_id: null,
        notes: ANCIEN_NOTES[idx % ANCIEN_NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }

    // 1 membre dont le mandat expire bientôt (dans les 3 prochains mois)
    if (memberIdx < ids.length && idx % 2 === 0) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[memberIdx++],
        role: 'membre',
        date_election: '2023-04-15',
        date_fin_mandat: '2026-04-15',
        ag_election_id: null,
        notes: EXPIRE_BIENTOT_NOTES[idx % EXPIRE_BIENTOT_NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }

    // 1 ancien président (mandat expiré depuis longtemps)
    if (memberIdx < ids.length && idx % 3 === 1) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[memberIdx++],
        role: 'president',
        date_election: '2019-06-20',
        date_fin_mandat: '2022-06-20',
        ag_election_id: null,
        notes: 'Ancien président (2019-2022). A mené les travaux de réfection de la toiture.',
        created_at: now,
        updated_at: now,
      })
    }
  }

  if (conseilData.length > 0) {
    await knex('conseil_syndical').insert(conseilData)
  }
}
