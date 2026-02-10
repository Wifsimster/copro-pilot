/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Clean existing data
  await knex('propositions_syndic').del()
  await knex('contrats_syndic').del()

  // Get copropriete IDs
  const coproprietes = await knex('coproprietes').select('id', 'nom')
  if (coproprietes.length === 0) return

  const coproId1 = coproprietes[0].id
  const coproId2 = coproprietes.length > 1 ? coproprietes[1].id : coproId1

  // Contrats de syndic
  await knex('contrats_syndic').insert([
    {
      copropriete_id: coproId1,
      syndic_nom: 'Cabinet Foncia Immobilier',
      date_debut: '2024-01-01',
      date_fin: '2026-12-31',
      remuneration_forfait: 18500.00,
      prestations_incluses: 'Gestion courante, convocations AG, tenue comptabilite, recouvrement charges, gestion sinistres courants',
      prestations_particulieres: 'Travaux exceptionnels (honoraires 3% HT), contentieux (150 EUR/h), etat date (380 EUR)',
      conditions_execution: 'Permanence telephonique du lundi au vendredi 9h-18h. Visite mensuelle de la copropriete.',
      statut: 'en_cours',
      notes: 'Contrat renouvele lors de l\'AG du 15/03/2024. Vote a la majorite absolue (art. 25).',
    },
    {
      copropriete_id: coproId1,
      syndic_nom: 'Nexity Property Management',
      date_debut: '2021-01-01',
      date_fin: '2023-12-31',
      remuneration_forfait: 16200.00,
      prestations_incluses: 'Gestion courante, convocations AG, tenue comptabilite',
      prestations_particulieres: 'Travaux (honoraires 4% HT), contentieux (180 EUR/h)',
      conditions_execution: 'Permanence telephonique du lundi au vendredi 9h-17h.',
      statut: 'expire',
      notes: 'Contrat non renouvele suite a mise en concurrence. Remplacement par Foncia.',
    },
    {
      copropriete_id: coproId2,
      syndic_nom: 'Citya Immobilier',
      date_debut: '2025-04-01',
      date_fin: '2028-03-31',
      remuneration_forfait: 22000.00,
      prestations_incluses: 'Gestion courante, convocations AG, tenue comptabilite, recouvrement charges, archivage numerique',
      prestations_particulieres: 'Travaux exceptionnels (honoraires 2.5% HT), contentieux (140 EUR/h)',
      conditions_execution: 'Permanence telephonique et plateforme en ligne 24/7. Visite bimensuelle.',
      statut: 'en_cours',
      notes: 'Premier mandat. Designe lors de l\'AG extraordinaire du 20/03/2025.',
    },
  ])

  // Propositions de syndic (mise en concurrence)
  await knex('propositions_syndic').insert([
    {
      copropriete_id: coproId1,
      syndic_nom: 'Cabinet Foncia Immobilier',
      date_reception: '2023-11-15',
      montant_propose: 18500.00,
      prestations_proposees: 'Gestion courante complete, permanence telephonique etendue, visite mensuelle, plateforme extranet',
      retenue: true,
      notes: 'Meilleur rapport qualite-prix. Propose un extranet coproprietaires inclus.',
    },
    {
      copropriete_id: coproId1,
      syndic_nom: 'Nexity Property Management',
      date_reception: '2023-11-10',
      montant_propose: 17800.00,
      prestations_proposees: 'Gestion courante, permanence telephonique standard, comptabilite en ligne',
      retenue: false,
      notes: 'Offre competitive mais prestations moins completes que Foncia.',
    },
    {
      copropriete_id: coproId1,
      syndic_nom: 'Sergic',
      date_reception: '2023-11-20',
      montant_propose: 21000.00,
      prestations_proposees: 'Gestion premium, gardiennage, entretien espaces verts, plateforme numerique',
      retenue: false,
      notes: 'Offre trop couteuse pour le niveau de prestation souhaite.',
    },
    {
      copropriete_id: coproId2,
      syndic_nom: 'Citya Immobilier',
      date_reception: '2025-01-20',
      montant_propose: 22000.00,
      prestations_proposees: 'Gestion courante complete, archivage numerique, plateforme en ligne 24/7, visites regulieres',
      retenue: true,
      notes: 'Retenue pour la qualite de la plateforme numerique et le suivi proactif.',
    },
    {
      copropriete_id: coproId2,
      syndic_nom: 'Immo de France',
      date_reception: '2025-01-25',
      montant_propose: 19500.00,
      prestations_proposees: 'Gestion courante, comptabilite, convocations AG',
      retenue: false,
      notes: 'Offre correcte mais manque d\'outils numeriques.',
    },
  ])
}
