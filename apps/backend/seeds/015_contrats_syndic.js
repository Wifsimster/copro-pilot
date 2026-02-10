/**
 * Seed: contrats syndic & propositions syndic
 * Creates syndic contracts and competing proposals for all coproprietes
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('propositions_syndic').del()
  await knex('contrats_syndic').del()

  const coproprietes = await knex('coproprietes').select('id', 'nom').orderBy('id')
  if (coproprietes.length === 0) return

  const now = new Date()

  const SYNDICS = [
    'Cabinet Foncia Immobilier',
    'Nexity Property Management',
    'Citya Immobilier',
    'Sergic',
    'Immo de France',
    'Oralia Gestion',
    'Lamy Assurances et Gestion',
    'Bouygues Immobilier Syndic',
    'Square Habitat',
    'Cabinet Billon Immobilier',
  ]

  const PRESTATIONS_INCLUSES = [
    'Gestion courante, convocations AG, tenue comptabilite, recouvrement charges, gestion sinistres courants',
    'Gestion courante complete, permanence telephonique etendue, visite mensuelle, plateforme extranet',
    'Gestion courante, convocations AG, tenue comptabilite, recouvrement charges, archivage numerique',
    'Gestion courante, comptabilite en ligne, suivi technique, plateforme coproprietaires',
    'Gestion premium, gardiennage, entretien espaces verts, plateforme numerique',
    'Gestion courante, comptabilite, convocations AG, gestion des sinistres',
    'Gestion complete avec extranet, visites bimestrielles, reporting trimestriel',
    'Gestion courante, permanence telephonique, comptabilite certifiee',
  ]

  const PRESTATIONS_PARTICULIERES = [
    'Travaux exceptionnels (honoraires 3% HT), contentieux (150 EUR/h), etat date (380 EUR)',
    'Travaux (honoraires 4% HT), contentieux (180 EUR/h)',
    'Travaux exceptionnels (honoraires 2.5% HT), contentieux (140 EUR/h)',
    'Travaux (honoraires 3.5% HT), contentieux (160 EUR/h), etat date (350 EUR)',
    'Travaux (honoraires 2% HT), contentieux (200 EUR/h), mutations (400 EUR)',
    'Travaux exceptionnels (honoraires 3% HT), contentieux (170 EUR/h), etat date (400 EUR)',
  ]

  const CONDITIONS = [
    'Permanence telephonique du lundi au vendredi 9h-18h. Visite mensuelle de la copropriete.',
    'Permanence telephonique et plateforme en ligne 24/7. Visite bimensuelle.',
    'Permanence telephonique du lundi au vendredi 9h-17h.',
    'Permanence telephonique etendue 8h-20h. Visite hebdomadaire. Astreinte week-end.',
    'Permanence telephonique standard. Visite trimestrielle. Reporting en ligne.',
    'Plateforme en ligne 24/7. Visite mensuelle. Rapport de visite systematique.',
  ]

  const CONTRAT_NOTES = [
    'Contrat renouvele lors de l\'AG ordinaire. Vote a la majorite absolue (art. 25).',
    'Premier mandat. Designe lors de l\'AG extraordinaire.',
    'Renouvellement tacite. Aucune mise en concurrence cette annee.',
    'Contrat issu d\'une mise en concurrence avec 3 candidats.',
    'Syndic designe apres demission du precedent. AG extraordinaire.',
    'Renouvellement apres evaluation favorable du conseil syndical.',
    'Contrat negocie avec baisse des honoraires de 5% par rapport au mandat precedent.',
    'Premier mandat suite a changement de syndic vote en AG ordinaire.',
  ]

  const contratData = []
  const propositionData = []

  for (let idx = 0; idx < coproprietes.length; idx++) {
    const coproId = coproprietes[idx].id
    const syndicActuel = SYNDICS[idx % SYNDICS.length]
    const syndicPrecedent = SYNDICS[(idx + 3) % SYNDICS.length]

    // Current active contract
    const remunerationBase = 15000 + (idx * 1500)
    contratData.push({
      copropriete_id: coproId,
      syndic_nom: syndicActuel,
      date_debut: `${2024 - (idx % 2)}-${String((idx % 12) + 1).padStart(2, '0')}-01`,
      date_fin: `${2027 - (idx % 2)}-${String((idx % 12) + 1).padStart(2, '0')}-01`,
      remuneration_forfait: remunerationBase,
      prestations_incluses: PRESTATIONS_INCLUSES[idx % PRESTATIONS_INCLUSES.length],
      prestations_particulieres: PRESTATIONS_PARTICULIERES[idx % PRESTATIONS_PARTICULIERES.length],
      conditions_execution: CONDITIONS[idx % CONDITIONS.length],
      statut: 'en_cours',
      notes: CONTRAT_NOTES[idx % CONTRAT_NOTES.length],
      created_at: now,
      updated_at: now,
    })

    // Previous expired contract (for half the coproprietes)
    if (idx % 2 === 0) {
      contratData.push({
        copropriete_id: coproId,
        syndic_nom: syndicPrecedent,
        date_debut: `${2021 - (idx % 3)}-01-01`,
        date_fin: `${2024 - (idx % 2)}-${String((idx % 12) + 1).padStart(2, '0')}-01`,
        remuneration_forfait: Math.round(remunerationBase * 0.88),
        prestations_incluses: PRESTATIONS_INCLUSES[(idx + 2) % PRESTATIONS_INCLUSES.length],
        prestations_particulieres: PRESTATIONS_PARTICULIERES[(idx + 2) % PRESTATIONS_PARTICULIERES.length],
        conditions_execution: CONDITIONS[(idx + 2) % CONDITIONS.length],
        statut: 'expire',
        notes: 'Contrat non renouvele suite a mise en concurrence.',
        created_at: now,
        updated_at: now,
      })
    }

    // Propositions (2-3 per copropriete for the current contract selection)
    const nbPropositions = idx % 3 === 0 ? 3 : 2
    const dateReception = `${2024 - (idx % 2)}-${String(Math.max(1, (idx % 12))).padStart(2, '0')}-${String((idx % 20) + 5).padStart(2, '0')}`

    // Winning proposal
    propositionData.push({
      copropriete_id: coproId,
      syndic_nom: syndicActuel,
      date_reception: dateReception,
      montant_propose: remunerationBase,
      prestations_proposees: PRESTATIONS_INCLUSES[idx % PRESTATIONS_INCLUSES.length],
      retenue: true,
      notes: ['Meilleur rapport qualite-prix.', 'Offre la plus complete.', 'Recommandee par le conseil syndical.', 'Meilleure reactivite lors des echanges.'][idx % 4],
      created_at: now,
      updated_at: now,
    })

    // Losing proposals
    for (let p = 1; p < nbPropositions; p++) {
      const concurrent = SYNDICS[(idx + p + 1) % SYNDICS.length]
      const montantConcurrent = Math.round(remunerationBase * (0.85 + p * 0.12))
      propositionData.push({
        copropriete_id: coproId,
        syndic_nom: concurrent,
        date_reception: dateReception,
        montant_propose: montantConcurrent,
        prestations_proposees: PRESTATIONS_INCLUSES[(idx + p) % PRESTATIONS_INCLUSES.length],
        retenue: false,
        notes: ['Offre correcte mais prestations moins completes.', 'Tarif competitif mais manque d\'outils numeriques.', 'Offre trop couteuse pour le niveau de prestation.', 'Bonne offre mais references insuffisantes.'][(idx + p) % 4],
        created_at: now,
        updated_at: now,
      })
    }
  }

  if (contratData.length > 0) {
    await knex('contrats_syndic').insert(contratData)
  }
  if (propositionData.length > 0) {
    await knex('propositions_syndic').insert(propositionData)
  }
}
