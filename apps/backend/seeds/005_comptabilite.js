/**
 * Seed: budgets_previsionnels, postes_depenses, appels_fonds, appels_fonds_lignes, paiements, fonds_travaux
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('budgets_previsionnels').count('id as cnt').first()
  if (existing.cnt > 0) return

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // --- Budgets prévisionnels (2 years per copropriete: 2025, 2026) ---
  const budgetsData = []
  for (const coproId of coproIds) {
    budgetsData.push(
      { copropriete_id: coproId, annee: 2025, montant_total: 45000 + (coproId * 5000), statut: 'approuve', date_vote: '2024-12-15', notes: 'Budget voté en AG ordinaire', created_at: now, updated_at: now },
      { copropriete_id: coproId, annee: 2026, montant_total: 48000 + (coproId * 5000), statut: 'brouillon', date_vote: null, notes: 'Budget prévisionnel en préparation', created_at: now, updated_at: now }
    )
  }
  const insertedBudgets = await knex('budgets_previsionnels').insert(budgetsData).returning(['id', 'copropriete_id', 'annee'])

  // Get clés de répartition "Générale" per copro
  const cles = await knex('cles_repartition').select('id', 'copropriete_id').where('nom', 'Générale')
  const cleGeneraleBycopro = {}
  for (const c of cles) cleGeneraleBycopro[c.copropriete_id] = c.id

  // --- Postes de dépenses (5 per budget) ---
  const POSTES = [
    { nom: 'Entretien courant', categorie: 'entretien', pct: 0.25 },
    { nom: 'Assurance immeuble', categorie: 'assurance', pct: 0.15 },
    { nom: 'Gardiennage', categorie: 'personnel', pct: 0.20 },
    { nom: 'Électricité parties communes', categorie: 'energie', pct: 0.10 },
    { nom: 'Honoraires syndic', categorie: 'gestion', pct: 0.30 }
  ]

  const postesData = []
  for (const budget of insertedBudgets) {
    for (const poste of POSTES) {
      const montantPrevu = Math.round(budget.annee === 2025
        ? (45000 + budget.copropriete_id * 5000) * poste.pct
        : (48000 + budget.copropriete_id * 5000) * poste.pct)
      postesData.push({
        budget_id: budget.id,
        nom: poste.nom,
        categorie: poste.categorie,
        montant_prevu: montantPrevu,
        montant_reel: budget.annee === 2025 ? Math.round(montantPrevu * (0.9 + Math.random() * 0.2)) : null,
        cle_repartition_id: cleGeneraleBycopro[budget.copropriete_id] || null,
        created_at: now,
        updated_at: now
      })
    }
  }
  await knex('postes_depenses').insert(postesData)

  // --- Appels de fonds (4 trimestres 2025 per copropriete) ---
  const budgets2025 = insertedBudgets.filter((b) => b.annee === 2025)
  const appelsData = []
  for (const budget of budgets2025) {
    const montantTotal = 45000 + budget.copropriete_id * 5000
    for (let t = 1; t <= 4; t++) {
      appelsData.push({
        copropriete_id: budget.copropriete_id,
        budget_id: budget.id,
        trimestre: t,
        annee: 2025,
        montant_total: Math.round(montantTotal / 4),
        date_emission: `2025-${String((t - 1) * 3 + 1).padStart(2, '0')}-01`,
        date_echeance: `2025-${String((t - 1) * 3 + 1).padStart(2, '0')}-15`,
        statut: t <= 3 ? 'cloture' : 'emis',
        created_at: now,
        updated_at: now
      })
    }
  }
  const insertedAppels = await knex('appels_fonds').insert(appelsData).returning(['id', 'copropriete_id', 'trimestre', 'montant_total'])

  // --- Appels de fonds lignes (distribute each appel across lots of that copropriete) ---
  const lots = await knex('lots').select('id', 'copropriete_id', 'coproprietaire_id', 'tantiemes').orderBy('id')
  const lotsByCopro = {}
  for (const lot of lots) {
    if (!lotsByCopro[lot.copropriete_id]) lotsByCopro[lot.copropriete_id] = []
    lotsByCopro[lot.copropriete_id].push(lot)
  }

  const lignesData = []
  for (const appel of insertedAppels) {
    const coproLots = lotsByCopro[appel.copropriete_id] || []
    const totalTantiemes = coproLots.reduce((sum, l) => sum + l.tantiemes, 0)
    if (totalTantiemes === 0) continue

    for (const lot of coproLots) {
      lignesData.push({
        appel_fonds_id: appel.id,
        lot_id: lot.id,
        coproprietaire_id: lot.coproprietaire_id,
        montant: Math.round((appel.montant_total * lot.tantiemes / totalTantiemes) * 100) / 100,
        created_at: now,
        updated_at: now
      })
    }
  }
  // Insert in batches (can be large with many lots)
  for (let i = 0; i < lignesData.length; i += 500) {
    await knex('appels_fonds_lignes').insert(lignesData.slice(i, i + 500))
  }

  // --- Paiements (one per coproprietaire for Q1 and Q2 2025) ---
  const coproprietaires = await knex('coproprietaires').select('id').orderBy('id')
  const appelsQ1Q2 = insertedAppels.filter((a) => a.trimestre <= 2)

  // Index appels by copropriete_id + trimestre
  const appelIndex = {}
  for (const a of appelsQ1Q2) {
    if (!appelIndex[a.copropriete_id]) appelIndex[a.copropriete_id] = {}
    appelIndex[a.copropriete_id][a.trimestre] = a
  }

  const paiementsData = []
  const modes = ['virement', 'virement', 'prelevement', 'cheque', 'virement']
  let pIdx = 0
  for (const lot of lots) {
    for (let t = 1; t <= 2; t++) {
      const appel = appelIndex[lot.copropriete_id]?.[t]
      if (!appel || !lot.coproprietaire_id) continue
      const totalTantiemes = lotsByCopro[lot.copropriete_id].reduce((sum, l) => sum + l.tantiemes, 0)
      const montant = Math.round((appel.montant_total * lot.tantiemes / totalTantiemes) * 100) / 100

      paiementsData.push({
        coproprietaire_id: lot.coproprietaire_id,
        appel_fonds_id: appel.id,
        montant,
        date_paiement: `2025-${String((t - 1) * 3 + 1).padStart(2, '0')}-${String(5 + (pIdx % 20)).padStart(2, '0')}`,
        mode: modes[pIdx % modes.length],
        reference: `PAY-2025-${String(pIdx + 1).padStart(4, '0')}`,
        notes: null,
        created_at: now,
        updated_at: now
      })
      pIdx++
    }
  }
  // Insert in batches
  for (let i = 0; i < paiementsData.length; i += 500) {
    await knex('paiements').insert(paiementsData.slice(i, i + 500))
  }

  // --- Fonds de travaux (2025 + 2026 per copropriete) ---
  const fondsData = []
  for (const coproId of coproIds) {
    const budget2025 = 45000 + coproId * 5000
    fondsData.push(
      { copropriete_id: coproId, annee: 2025, cotisation_annuelle: Math.round(budget2025 * 0.05), solde: Math.round(budget2025 * 0.05 * 3), created_at: now, updated_at: now },
      { copropriete_id: coproId, annee: 2026, cotisation_annuelle: Math.round((48000 + coproId * 5000) * 0.05), solde: 0, created_at: now, updated_at: now }
    )
  }
  await knex('fonds_travaux').insert(fondsData)
}
