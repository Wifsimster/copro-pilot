/**
 * Seed: incidents, interventions, carnet_entretien
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('incidents').count('id as cnt').first()
  if (existing.cnt > 0) return

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Get some lots and coproprietaires for references
  const lots = await knex('lots').select('id', 'copropriete_id', 'coproprietaire_id').orderBy('id')
  const lotsByCopro = {}
  for (const lot of lots) {
    if (!lotsByCopro[lot.copropriete_id]) lotsByCopro[lot.copropriete_id] = []
    lotsByCopro[lot.copropriete_id].push(lot)
  }

  // --- Incidents (3-4 per copropriete = ~17 total) ---
  const INCIDENTS = [
    { titre: 'Fuite d\'eau au 3e étage', categorie: 'plomberie', urgence: 'haute', statut: 'resolu', description: 'Fuite provenant de la canalisation principale, dégâts des eaux dans le couloir' },
    { titre: 'Panne ascenseur', categorie: 'ascenseur', urgence: 'haute', statut: 'en_cours', description: 'Ascenseur bloqué entre le 2e et le 3e étage, technicien contacté' },
    { titre: 'Éclairage défectueux parking', categorie: 'electricite', urgence: 'moyenne', statut: 'ouvert', description: 'Plusieurs néons hors service dans le parking souterrain' },
    { titre: 'Fissure façade nord', categorie: 'structure', urgence: 'moyenne', statut: 'ouvert', description: 'Fissure apparue sur la façade nord, longueur ~2m' },
    { titre: 'Infiltration toiture', categorie: 'toiture', urgence: 'critique', statut: 'resolu', description: 'Infiltration d\'eau suite à fortes pluies, appartement dernier étage touché' },
    { titre: 'Porte d\'entrée principale cassée', categorie: 'serrurerie', urgence: 'haute', statut: 'resolu', description: 'Gâche électrique HS, porte ne ferme plus' },
    { titre: 'Nuisibles dans les caves', categorie: 'hygiene', urgence: 'moyenne', statut: 'en_cours', description: 'Présence de rongeurs signalée dans les caves du sous-sol' },
    { titre: 'Vandalisme boîtes aux lettres', categorie: 'securite', urgence: 'faible', statut: 'ferme', description: 'Plusieurs boîtes aux lettres forcées, remplacement effectué' },
    { titre: 'Fuite robinet local poubelles', categorie: 'plomberie', urgence: 'faible', statut: 'ouvert', description: 'Robinet du local poubelles goutte en permanence' },
    { titre: 'Bruit chaudière anormal', categorie: 'chauffage', urgence: 'moyenne', statut: 'en_cours', description: 'Bruit métallique provenant de la chaufferie depuis 3 jours' },
    { titre: 'Graffiti sur façade', categorie: 'entretien', urgence: 'faible', statut: 'ouvert', description: 'Tags sur le mur de la façade côté rue' },
    { titre: 'Vitre cassée hall d\'entrée', categorie: 'vitrerie', urgence: 'moyenne', statut: 'resolu', description: 'Vitre de la porte d\'entrée brisée accidentellement' },
    { titre: 'Canalisation bouchée sous-sol', categorie: 'plomberie', urgence: 'haute', statut: 'resolu', description: 'Engorgement des canalisations au sous-sol, refoulement' },
    { titre: 'Interphone en panne', categorie: 'electricite', urgence: 'moyenne', statut: 'ouvert', description: 'L\'interphone ne fonctionne plus depuis la mise à jour du système' },
    { titre: 'Dégât des eaux parking', categorie: 'plomberie', urgence: 'haute', statut: 'en_cours', description: 'Eau stagnante dans le parking après fortes pluies' }
  ]

  const incidentsData = []
  let incIdx = 0
  for (const coproId of coproIds) {
    const coproLots = lotsByCopro[coproId] || []
    const count = 3
    for (let j = 0; j < count; j++) {
      const inc = INCIDENTS[incIdx % INCIDENTS.length]
      const lot = coproLots[j % coproLots.length]
      const month = (incIdx % 12) + 1
      incidentsData.push({
        copropriete_id: coproId,
        lot_id: inc.categorie === 'plomberie' || inc.categorie === 'electricite' ? lot?.id : null,
        signale_par_id: lot?.coproprietaire_id || null,
        titre: inc.titre,
        description: inc.description,
        categorie: inc.categorie,
        urgence: inc.urgence,
        statut: inc.statut,
        date_signalement: `2025-${String(month).padStart(2, '0')}-${String((incIdx % 28) + 1).padStart(2, '0')}`,
        date_resolution: inc.statut === 'resolu' ? `2025-${String(Math.min(month + 1, 12)).padStart(2, '0')}-${String((incIdx % 20) + 5).padStart(2, '0')}` : null,
        notes: inc.statut === 'resolu' ? 'Résolu par le prestataire' : null,
        created_at: now,
        updated_at: now
      })
      incIdx++
    }
  }
  const insertedIncidents = await knex('incidents').insert(incidentsData).returning(['id', 'copropriete_id', 'statut', 'categorie'])

  // --- Interventions (one per incident that is en_cours or resolu) ---
  const PRESTATAIRES = [
    'Plomberie Martin SARL', 'Ascenseurs Kone', 'Électricité Générale Plus',
    'BTP Rénovation Côte d\'Azur', 'Toitures de France', 'Serrurier Express',
    'Dératisation Pro', 'Nettoyage Urbain Services', 'Chauffage Maintenance',
    'Vitrerie Duval & Fils'
  ]

  const interventionsData = []
  const resolvedOrEnCours = insertedIncidents.filter((i) => i.statut === 'resolu' || i.statut === 'en_cours')

  for (let k = 0; k < resolvedOrEnCours.length; k++) {
    const inc = resolvedOrEnCours[k]
    const isResolu = inc.statut === 'resolu'
    const montantDevis = 500 + (k * 300) + ((k % 5) * 200)
    interventionsData.push({
      incident_id: inc.id,
      copropriete_id: inc.copropriete_id,
      prestataire: PRESTATAIRES[k % PRESTATAIRES.length],
      description: `Intervention suite à incident: ${inc.categorie}`,
      montant_devis: montantDevis,
      montant_facture: isResolu ? Math.round(montantDevis * (0.95 + Math.random() * 0.1)) : null,
      date_prevue: `2025-${String((k % 12) + 1).padStart(2, '0')}-${String((k % 20) + 5).padStart(2, '0')}`,
      date_realisation: isResolu ? `2025-${String((k % 12) + 1).padStart(2, '0')}-${String((k % 20) + 8).padStart(2, '0')}` : null,
      statut: isResolu ? 'terminee' : 'en_cours',
      notes: isResolu ? 'Travaux réalisés conformément au devis' : 'Intervention programmée',
      created_at: now,
      updated_at: now
    })
  }

  // Also add a few standalone interventions (planned maintenance)
  for (let m = 0; m < coproIds.length; m++) {
    interventionsData.push({
      incident_id: null,
      copropriete_id: coproIds[m],
      prestataire: PRESTATAIRES[(m + 5) % PRESTATAIRES.length],
      description: ['Entretien annuel chaudière', 'Vérification ascenseur trimestrielle', 'Nettoyage toiture et gouttières', 'Désinsectisation préventive', 'Contrôle électrique quinquennal'][m % 5],
      montant_devis: [1200, 800, 1500, 600, 2000][m % 5],
      montant_facture: [1200, 800, 1500, 600, 2000][m % 5],
      date_prevue: `2025-${String((m * 2 % 12) + 1).padStart(2, '0')}-10`,
      date_realisation: `2025-${String((m * 2 % 12) + 1).padStart(2, '0')}-10`,
      statut: 'terminee',
      notes: 'Maintenance préventive planifiée',
      created_at: now,
      updated_at: now
    })
  }

  const insertedInterventions = await knex('interventions').insert(interventionsData).returning(['id', 'copropriete_id', 'description', 'date_realisation', 'prestataire', 'montant_facture'])

  // --- Carnet d'entretien (one entry per completed intervention) ---
  const CATEGORIES_ENTRETIEN = ['plomberie', 'ascenseur', 'électricité', 'structure', 'toiture', 'serrurerie', 'hygiène', 'sécurité', 'chauffage', 'vitrerie', 'entretien', 'contrôle']

  const carnetData = []
  const completedInterventions = insertedInterventions.filter((i) => i.date_realisation)
  for (let n = 0; n < completedInterventions.length; n++) {
    const inter = completedInterventions[n]
    carnetData.push({
      copropriete_id: inter.copropriete_id,
      titre: inter.description,
      description: `Réalisé par ${inter.prestataire}`,
      prestataire: inter.prestataire,
      montant: inter.montant_facture,
      date_realisation: inter.date_realisation,
      categorie: CATEGORIES_ENTRETIEN[n % CATEGORIES_ENTRETIEN.length],
      intervention_id: inter.id,
      created_at: now,
      updated_at: now
    })
  }
  if (carnetData.length > 0) {
    await knex('carnet_entretien').insert(carnetData)
  }
}
