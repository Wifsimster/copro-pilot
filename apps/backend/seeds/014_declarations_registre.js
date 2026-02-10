/**
 * Seed: declarations au registre national des copropriétés
 * Creates annual declarations for each copropriete (2023-2025)
 * with realistic aggregated data (donnees_declarees)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('declarations_registre').del()

  const now = new Date()
  const copros = await knex('coproprietes').select('*').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Fetch lots stats per copropriete
  const lotsStats = {}
  for (const coproId of coproIds) {
    const stats = await knex('lots')
      .where('copropriete_id', coproId)
      .select(
        knex.raw('count(*) as total'),
        knex.raw('coalesce(sum(tantiemes), 0) as total_tantiemes')
      )
      .first()
    const parType = await knex('lots')
      .where('copropriete_id', coproId)
      .select('type')
      .count('* as count')
      .groupBy('type')
    const coproCount = await knex('lots')
      .where('copropriete_id', coproId)
      .whereNotNull('coproprietaire_id')
      .countDistinct('coproprietaire_id as count')
      .first()

    lotsStats[coproId] = {
      total: Number(stats?.total || 0),
      total_tantiemes: Number(stats?.total_tantiemes || 0),
      par_type: parType.map((t) => ({ type: t.type, count: Number(t.count) })),
      nombre_coproprietaires: Number(coproCount?.count || 0),
    }
  }

  // Fetch employes per copropriete
  const employesByCopro = {}
  for (const coproId of coproIds) {
    const employes = await knex('employes_syndicat')
      .where('copropriete_id', coproId)
      .where('statut', 'actif')
    employesByCopro[coproId] = employes
  }

  // Declaration templates per year
  const declarationsData = []

  for (let coproIdx = 0; coproIdx < copros.length; coproIdx++) {
    const copro = copros[coproIdx]
    const coproId = copro.id
    const lots = lotsStats[coproId]
    const employes = employesByCopro[coproId] || []

    // 2023 — validated declaration
    declarationsData.push({
      copropriete_id: coproId,
      annee: 2023,
      date_declaration: '2024-01-15',
      statut: 'valide',
      notes: 'Déclaration annuelle 2023 validée par le registre national.',
      donnees_declarees: JSON.stringify({
        identification: {
          nom: copro.nom,
          adresse: copro.adresse,
          code_postal: copro.code_postal,
          ville: copro.ville,
          numero_immatriculation: copro.numero_immatriculation,
          date_creation: copro.date_creation,
          nombre_batiments: copro.nombre_batiments || 0,
          nombre_ascenseurs: copro.nombre_ascenseurs || 0,
          periode_construction: copro.periode_construction,
          type_chauffage: copro.type_chauffage,
          energie_chauffage: copro.energie_chauffage,
        },
        lots: {
          ...lots,
          // Use slightly fewer for 2023 (simulate growth)
          total: Math.max(lots.total - (coproIdx % 3), lots.total),
        },
        finances: {
          budget_annee: 2023,
          budget_montant: 40000 + coproId * 4500,
          budget_statut: 'approuve',
          appels_fonds_nombre: 4,
          appels_fonds_montant: 40000 + coproId * 4500,
          fonds_travaux_cotisation: Math.round((40000 + coproId * 4500) * 0.05),
          fonds_travaux_solde: Math.round((40000 + coproId * 4500) * 0.05 * 2),
        },
        personnel: {
          nombre_employes: employes.length,
          employes: employes.map((e) => ({
            nom: e.nom,
            prenom: e.prenom,
            poste: e.poste,
            type_contrat: e.type_contrat,
          })),
        },
      }),
      created_at: now,
      updated_at: now,
    })

    // 2024 — submitted declaration
    declarationsData.push({
      copropriete_id: coproId,
      annee: 2024,
      date_declaration: '2025-02-10',
      statut: 'soumis',
      notes: 'Déclaration 2024 soumise au registre, en attente de validation.',
      donnees_declarees: JSON.stringify({
        identification: {
          nom: copro.nom,
          adresse: copro.adresse,
          code_postal: copro.code_postal,
          ville: copro.ville,
          numero_immatriculation: copro.numero_immatriculation,
          date_creation: copro.date_creation,
          nombre_batiments: copro.nombre_batiments || 0,
          nombre_ascenseurs: copro.nombre_ascenseurs || 0,
          periode_construction: copro.periode_construction,
          type_chauffage: copro.type_chauffage,
          energie_chauffage: copro.energie_chauffage,
        },
        lots,
        finances: {
          budget_annee: 2024,
          budget_montant: 42000 + coproId * 4800,
          budget_statut: 'approuve',
          appels_fonds_nombre: 4,
          appels_fonds_montant: 42000 + coproId * 4800,
          fonds_travaux_cotisation: Math.round((42000 + coproId * 4800) * 0.05),
          fonds_travaux_solde: Math.round((42000 + coproId * 4800) * 0.05 * 2.5),
        },
        personnel: {
          nombre_employes: employes.length,
          employes: employes.map((e) => ({
            nom: e.nom,
            prenom: e.prenom,
            poste: e.poste,
            type_contrat: e.type_contrat,
          })),
        },
      }),
      created_at: now,
      updated_at: now,
    })

    // 2025 — draft declaration (current year)
    declarationsData.push({
      copropriete_id: coproId,
      annee: 2025,
      date_declaration: null,
      statut: 'brouillon',
      notes: 'Déclaration 2025 en cours de préparation.',
      donnees_declarees: JSON.stringify({
        identification: {
          nom: copro.nom,
          adresse: copro.adresse,
          code_postal: copro.code_postal,
          ville: copro.ville,
          numero_immatriculation: copro.numero_immatriculation,
          date_creation: copro.date_creation,
          nombre_batiments: copro.nombre_batiments || 0,
          nombre_ascenseurs: copro.nombre_ascenseurs || 0,
          periode_construction: copro.periode_construction,
          type_chauffage: copro.type_chauffage,
          energie_chauffage: copro.energie_chauffage,
        },
        lots,
        finances: {
          budget_annee: 2025,
          budget_montant: 45000 + coproId * 5000,
          budget_statut: 'approuve',
          appels_fonds_nombre: 4,
          appels_fonds_montant: 45000 + coproId * 5000,
          fonds_travaux_cotisation: Math.round((45000 + coproId * 5000) * 0.05),
          fonds_travaux_solde: Math.round((45000 + coproId * 5000) * 0.05 * 3),
        },
        personnel: {
          nombre_employes: employes.length,
          employes: employes.map((e) => ({
            nom: e.nom,
            prenom: e.prenom,
            poste: e.poste,
            type_contrat: e.type_contrat,
          })),
        },
      }),
      created_at: now,
      updated_at: now,
    })
  }

  await knex('declarations_registre').insert(declarationsData)
}
