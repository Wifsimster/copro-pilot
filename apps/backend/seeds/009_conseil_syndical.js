/**
 * Seed: conseil_syndical
 * Creates conseil syndical members for each copropriete
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('conseil_syndical').count('id as cnt').first()
  if (existing.cnt > 0) return

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

  // Get past assemblees for AG election references
  const pastAGs = await knex('assemblees_generales')
    .select('id', 'copropriete_id')
    .where('statut', 'terminee')
    .orderBy('id')

  const agByCopro = {}
  for (const ag of pastAGs) {
    if (!agByCopro[ag.copropriete_id]) {
      agByCopro[ag.copropriete_id] = ag.id
    }
  }

  const NOTES = [
    'Élu à l\'unanimité',
    'Reconduit dans ses fonctions',
    'Membre actif, participe à toutes les réunions',
    'Spécialiste des questions juridiques',
    'Référent travaux et entretien',
    'En charge du suivi financier',
    'Ancien président, expérience précieuse',
    'Nouveau membre élu lors de la dernière AG',
    null,
    null,
    null,
  ]

  const conseilData = []

  for (const coproId of coproIds) {
    const coproprietaireIds = coproprietairesByCopro[coproId]
    if (!coproprietaireIds || coproprietaireIds.size < 3) continue

    const ids = Array.from(coproprietaireIds)
    const agId = agByCopro[coproId] || null

    // 1 president
    conseilData.push({
      copropriete_id: coproId,
      coproprietaire_id: ids[0],
      role: 'president',
      date_election: '2025-06-15',
      date_fin_mandat: '2028-06-15',
      ag_election_id: agId,
      notes: NOTES[0],
      created_at: now,
      updated_at: now,
    })

    // 2-3 membres
    const nbMembres = Math.min(ids.length - 1, 3)
    for (let i = 1; i <= nbMembres; i++) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[i],
        role: 'membre',
        date_election: '2025-06-15',
        date_fin_mandat: '2028-06-15',
        ag_election_id: agId,
        notes: NOTES[(i + 1) % NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }

    // 1 suppleant if enough coproprietaires
    if (ids.length > nbMembres + 1) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[nbMembres + 1],
        role: 'suppleant',
        date_election: '2025-06-15',
        date_fin_mandat: '2028-06-15',
        ag_election_id: agId,
        notes: NOTES[7],
        created_at: now,
        updated_at: now,
      })
    }

    // 1 ancien membre (mandat expiré) if enough coproprietaires
    if (ids.length > nbMembres + 2) {
      conseilData.push({
        copropriete_id: coproId,
        coproprietaire_id: ids[nbMembres + 2],
        role: 'membre',
        date_election: '2022-06-10',
        date_fin_mandat: '2025-06-10',
        ag_election_id: null,
        notes: 'Ancien membre, mandat non renouvelé',
        created_at: now,
        updated_at: now,
      })
    }
  }

  if (conseilData.length > 0) {
    await knex('conseil_syndical').insert(conseilData)
  }
}
