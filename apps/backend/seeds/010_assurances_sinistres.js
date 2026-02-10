/**
 * Seed: assurances & sinistres
 * Creates insurance policies and claims for each copropriete
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('sinistres').del()
  await knex('assurances').del()

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Get incidents for linking sinistres
  const incidents = await knex('incidents')
    .select('id', 'copropriete_id', 'titre', 'date_signalement')
    .orderBy('id')

  const incidentsByCopro = {}
  for (const inc of incidents) {
    if (!incidentsByCopro[inc.copropriete_id]) incidentsByCopro[inc.copropriete_id] = []
    incidentsByCopro[inc.copropriete_id].push(inc)
  }

  const COMPAGNIES = [
    'AXA Assurances',
    'MAIF',
    'Allianz France',
    'Generali',
    'Groupama',
  ]

  const TYPES = ['multirisque_immeuble', 'responsabilite_civile', 'dommages_ouvrage', 'protection_juridique']

  const ASSURANCE_NOTES = [
    'Contrat renouvelé automatiquement chaque année. Franchise réduite après 3 ans sans sinistre.',
    'Police couvrant les parties communes et les éléments d\'équipement collectifs.',
    'Garantie étendue incluant les dégâts des eaux, incendie, catastrophes naturelles et vandalisme.',
    'Couverture responsabilité civile du syndicat des copropriétaires.',
    'Protection juridique pour litiges avec prestataires et voisinage.',
    'Assurance dommages-ouvrage souscrite dans le cadre des travaux de rénovation énergétique.',
    'Police négociée via le courtier du syndic. Tarif préférentiel groupe.',
    'Couverture tous risques avec option vol et bris de glace.',
  ]

  const SINISTRE_DESCRIPTIONS = [
    'Dégât des eaux suite à une fuite sur la colonne montante du bâtiment A.',
    'Incendie dans le local poubelle. Dégâts limités aux containers et à la porte coupe-feu.',
    'Infiltration par la toiture terrasse lors de fortes pluies. Plafond du 5e étage endommagé.',
    'Bris de la porte vitrée du hall d\'entrée suite à une tentative d\'effraction.',
    'Dégât des eaux provenant de l\'appartement du 4e étage, touchant le 3e et le 2e.',
    'Fissures structurelles apparues sur la façade côté rue après travaux de voirie.',
    'Vandalisme dans le parking souterrain : 3 luminaires et 1 barrière endommagés.',
    'Chute d\'un arbre du jardin sur la clôture de la copropriété lors d\'une tempête.',
    'Court-circuit dans le tableau électrique des parties communes. Remplacement nécessaire.',
    'Affaissement du sol dans la cour intérieure, canalisation d\'évacuation rompue.',
  ]

  const SINISTRE_NOTES = [
    'Expert mandaté par la compagnie. Visite programmée.',
    'Dossier complet transmis à l\'assureur. En attente de retour.',
    'Franchise appliquée : montant retenu sur l\'indemnisation.',
    'Indemnisation versée. Travaux de remise en état en cours.',
    'Sinistre refusé par l\'assureur : défaut d\'entretien invoqué. Recours en cours.',
    'Expertise contradictoire demandée par le syndic.',
    'Règlement rapide. Bonne réactivité de la compagnie.',
    'Convention IRSI applicable. Gestion par l\'assureur de l\'immeuble.',
  ]

  const assuranceData = []
  const sinistreData = []

  for (let idx = 0; idx < coproIds.length; idx++) {
    const coproId = coproIds[idx]

    // Each copro has 2-3 assurance policies
    const nbAssurances = idx % 2 === 0 ? 3 : 2
    const coproAssurances = []

    for (let i = 0; i < nbAssurances; i++) {
      const compagnie = COMPAGNIES[(idx + i) % COMPAGNIES.length]
      const type = TYPES[i % TYPES.length]
      const isExpired = i === nbAssurances - 1 && idx % 3 === 0
      const yearOffset = i === 0 ? 0 : i

      const dateDebut = new Date(2024 - yearOffset, (idx + i * 3) % 12, 1)
      const dateFin = new Date(dateDebut)
      dateFin.setFullYear(dateFin.getFullYear() + 1)

      const primes = [1850.00, 2340.00, 950.00, 1200.00, 3100.00, 780.00, 1500.00, 2800.00]
      const franchises = [150.00, 250.00, 300.00, 500.00, 0, 200.00, 350.00, 150.00]

      const assurance = {
        copropriete_id: coproId,
        compagnie,
        numero_police: `POL-${2024 + idx}-${String(i + 1).padStart(4, '0')}`,
        type,
        date_debut: dateDebut.toISOString().split('T')[0],
        date_fin: dateFin.toISOString().split('T')[0],
        prime_annuelle: primes[(idx * 3 + i) % primes.length],
        franchise: franchises[(idx * 2 + i) % franchises.length],
        statut: isExpired ? 'expire' : 'actif',
        notes: ASSURANCE_NOTES[(idx + i) % ASSURANCE_NOTES.length],
        created_at: now,
        updated_at: now,
      }

      coproAssurances.push(assurance)
      assuranceData.push(assurance)
    }
  }

  // Insert assurances first, then get IDs
  if (assuranceData.length > 0) {
    await knex('assurances').insert(assuranceData)
  }

  // Fetch inserted assurances to get IDs
  const insertedAssurances = await knex('assurances').select('id', 'copropriete_id', 'type').orderBy('id')
  const assurancesByCopro = {}
  for (const a of insertedAssurances) {
    if (!assurancesByCopro[a.copropriete_id]) assurancesByCopro[a.copropriete_id] = []
    assurancesByCopro[a.copropriete_id].push(a)
  }

  // Create sinistres
  const STATUTS_SINISTRE = ['declare', 'en_instruction', 'accepte', 'refuse', 'clos']

  for (let idx = 0; idx < coproIds.length; idx++) {
    const coproId = coproIds[idx]
    const coproAssurances = assurancesByCopro[coproId] || []
    const coproIncidents = incidentsByCopro[coproId] || []

    // Each copro has 1-3 sinistres
    const nbSinistres = (idx % 3) + 1

    for (let i = 0; i < nbSinistres; i++) {
      const assurance = coproAssurances.length > 0 ? coproAssurances[i % coproAssurances.length] : null
      const incident = coproIncidents.length > i ? coproIncidents[i] : null

      const dateSinistre = new Date(2025, (idx + i * 2) % 12, ((idx + i) % 28) + 1)
      const dateDeclaration = new Date(dateSinistre)
      dateDeclaration.setDate(dateDeclaration.getDate() + ((i % 3) + 1))

      const montantsEstimes = [1500.00, 3200.00, 8500.00, 12000.00, 450.00, 25000.00, 6800.00, 2100.00]
      const montantEstime = montantsEstimes[(idx * 2 + i) % montantsEstimes.length]

      const statut = STATUTS_SINISTRE[(idx + i) % STATUTS_SINISTRE.length]
      const montantIndemnise = statut === 'accepte' || statut === 'clos'
        ? Math.round(montantEstime * (0.7 + (((idx + i) % 3) * 0.1)) * 100) / 100
        : null

      sinistreData.push({
        assurance_id: assurance ? assurance.id : null,
        incident_id: incident ? incident.id : null,
        copropriete_id: coproId,
        numero_sinistre: `SIN-${2025}-${String(idx * 10 + i + 1).padStart(5, '0')}`,
        date_sinistre: dateSinistre.toISOString().split('T')[0],
        date_declaration: dateDeclaration.toISOString().split('T')[0],
        description: SINISTRE_DESCRIPTIONS[(idx + i) % SINISTRE_DESCRIPTIONS.length],
        montant_estime: montantEstime,
        montant_indemnise: montantIndemnise,
        statut,
        notes: SINISTRE_NOTES[(idx + i) % SINISTRE_NOTES.length],
        created_at: now,
        updated_at: now,
      })
    }
  }

  if (sinistreData.length > 0) {
    await knex('sinistres').insert(sinistreData)
  }
}
