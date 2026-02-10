/**
 * Seed: parties_communes, cles_repartition, lot_cles_repartition, locataires, mutations
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('parties_communes').count('id as cnt').first()
  if (existing.cnt > 0) return

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // --- Parties communes (3-5 per copropriete) ---
  const PARTIES = [
    { nom: 'Hall d\'entrée', categorie: 'generales', description: 'Hall principal avec boîtes aux lettres' },
    { nom: 'Escalier principal', categorie: 'generales', description: 'Escalier desservant tous les étages' },
    { nom: 'Toiture', categorie: 'generales', description: 'Toiture terrasse avec étanchéité' },
    { nom: 'Jardin', categorie: 'generales', description: 'Espaces verts collectifs' },
    { nom: 'Parking souterrain', categorie: 'speciales', description: 'Parking en sous-sol niveau -1' },
    { nom: 'Local poubelles', categorie: 'generales', description: 'Local de tri sélectif' },
    { nom: 'Ascenseur', categorie: 'speciales', description: 'Ascenseur desservant du RDC au 6e' },
    { nom: 'Chaufferie', categorie: 'speciales', description: 'Chauffage collectif gaz' },
    { nom: 'Local vélos', categorie: 'generales', description: 'Local sécurisé pour vélos' },
    { nom: 'Façade', categorie: 'generales', description: 'Façades extérieures et ravalement' }
  ]

  const partiesData = []
  for (const coproId of coproIds) {
    const count = 3 + (coproId % 3) // 3-5 per copropriete
    for (let j = 0; j < count; j++) {
      const p = PARTIES[(coproId + j) % PARTIES.length]
      partiesData.push({
        copropriete_id: coproId,
        nom: p.nom,
        categorie: p.categorie,
        description: p.description,
        created_at: now,
        updated_at: now
      })
    }
  }
  await knex('parties_communes').insert(partiesData)

  // --- Clés de répartition (3 per copropriete) ---
  const CLES = [
    { nom: 'Générale', description: 'Charges générales de copropriété' },
    { nom: 'Ascenseur', description: 'Charges liées à l\'ascenseur' },
    { nom: 'Chauffage', description: 'Charges de chauffage collectif' }
  ]

  const clesData = []
  for (const coproId of coproIds) {
    for (const cle of CLES) {
      clesData.push({
        copropriete_id: coproId,
        nom: cle.nom,
        description: cle.description,
        created_at: now,
        updated_at: now
      })
    }
  }
  const insertedCles = await knex('cles_repartition').insert(clesData).returning(['id', 'copropriete_id', 'nom'])

  // --- Lot-clé répartition (each lot gets "Générale" key) ---
  const lots = await knex('lots').select('id', 'copropriete_id', 'tantiemes').orderBy('id')

  // Index clés by copropriete_id
  const clesByCopro = {}
  for (const cle of insertedCles) {
    if (!clesByCopro[cle.copropriete_id]) clesByCopro[cle.copropriete_id] = {}
    clesByCopro[cle.copropriete_id][cle.nom] = cle.id
  }

  const lotClesData = []
  for (const lot of lots) {
    const clesForCopro = clesByCopro[lot.copropriete_id]
    if (!clesForCopro) continue
    lotClesData.push({
      lot_id: lot.id,
      cle_repartition_id: clesForCopro['Générale'],
      quote_part: lot.tantiemes,
      created_at: now,
      updated_at: now
    })
  }
  // Insert in batches (can be large with many lots)
  for (let i = 0; i < lotClesData.length; i += 500) {
    await knex('lot_cles_repartition').insert(lotClesData.slice(i, i + 500))
  }

  // --- Locataires (5 per copropriete, distributed across coproprietes) ---
  const LOCATAIRES_NOMS = [
    { nom: 'Perrot', prenom: 'Lucas' }, { nom: 'Giraud', prenom: 'Emma' },
    { nom: 'Faure', prenom: 'Hugo' }, { nom: 'Barbier', prenom: 'Léa' },
    { nom: 'Arnaud', prenom: 'Nathan' }, { nom: 'Caron', prenom: 'Chloé' },
    { nom: 'Picard', prenom: 'Raphaël' }, { nom: 'Roger', prenom: 'Manon' },
    { nom: 'Schmitt', prenom: 'Louis' }, { nom: 'Colin', prenom: 'Alice' },
    { nom: 'Vidal', prenom: 'Jules' }, { nom: 'Meunier', prenom: 'Jade' },
    { nom: 'Brun', prenom: 'Gabriel' }, { nom: 'Renard', prenom: 'Inès' },
    { nom: 'Gaillard', prenom: 'Adam' }, { nom: 'Berger', prenom: 'Zoé' },
    { nom: 'Lacroix', prenom: 'Arthur' }, { nom: 'Poirier', prenom: 'Louise' },
    { nom: 'Bourgeois', prenom: 'Paul' }, { nom: 'Legrand', prenom: 'Lina' },
    { nom: 'Tessier', prenom: 'Théo' }, { nom: 'Dufour', prenom: 'Margaux' },
    { nom: 'Marchand', prenom: 'Enzo' }, { nom: 'Blanchard', prenom: 'Élise' },
    { nom: 'Renaud', prenom: 'Bastien' }, { nom: 'Fabre', prenom: 'Juliette' },
    { nom: 'Riviere', prenom: 'Clément' }, { nom: 'Leclerc', prenom: 'Lucie' },
    { nom: 'Carpentier', prenom: 'Victor' }, { nom: 'Brunet', prenom: 'Amandine' },
    { nom: 'Rey', prenom: 'Damien' }, { nom: 'Collet', prenom: 'Sarah' },
    { nom: 'Pons', prenom: 'Adrien' }, { nom: 'Martel', prenom: 'Charlotte' },
    { nom: 'Maillard', prenom: 'Maxime' }, { nom: 'Aubry', prenom: 'Marine' },
    { nom: 'Lecomte', prenom: 'Romain' }, { nom: 'Prevost', prenom: 'Estelle' },
    { nom: 'Chartier', prenom: 'Quentin' }, { nom: 'Barre', prenom: 'Noémie' },
    { nom: 'Fernandez', prenom: 'Léo' }, { nom: 'Boucher', prenom: 'Agathe' },
    { nom: 'Delorme', prenom: 'Ethan' }, { nom: 'Guyot', prenom: 'Diane' },
    { nom: 'Da Costa', prenom: 'Mathis' }, { nom: 'Perez', prenom: 'Amélie' },
    { nom: 'Hubert', prenom: 'Alexandre' }, { nom: 'Deschamps', prenom: 'Virginie' },
    { nom: 'Boulanger', prenom: 'Benoît' }, { nom: 'Guillaume', prenom: 'Pauline' }
  ]

  const locatairesData = []
  let locIdx = 0
  const locPerCopro = 5

  for (const coproId of coproIds) {
    const apptLots = await knex('lots')
      .where({ copropriete_id: coproId, type: 'appartement' })
      .select('id')
      .orderBy('id')
      .limit(locPerCopro)

    for (const lot of apptLots) {
      const l = LOCATAIRES_NOMS[locIdx % LOCATAIRES_NOMS.length]
      locatairesData.push({
        lot_id: lot.id,
        nom: l.nom,
        prenom: l.prenom,
        email: `${l.prenom.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.${l.nom.toLowerCase()}@email.fr`,
        telephone: `07 ${String(locIdx + 10).padStart(2, '0')} ${String(locIdx + 20).padStart(2, '0')} ${String(locIdx + 30).padStart(2, '0')} ${String(locIdx + 40).padStart(2, '0')}`,
        date_entree: `202${3 + (locIdx % 3)}-${String((locIdx % 12) + 1).padStart(2, '0')}-01`,
        date_sortie: null,
        created_at: now,
        updated_at: now
      })
      locIdx++
    }
  }
  await knex('locataires').insert(locatairesData)

  // --- Mutations (2 per copropriete, distributed) ---
  const MUTATION_TYPES = ['vente', 'vente', 'donation', 'vente', 'succession', 'vente', 'vente', 'donation', 'vente', 'vente']
  const MUTATION_NOTES = [
    'Vente notariée', 'Acquisition premier achat', 'Donation familiale',
    'Vente aux enchères', 'Succession suite décès', 'Vente classique',
    'Vente investisseur', 'Donation entre époux', 'Vente après divorce', 'Vente déménagement'
  ]

  const mutationsData = []
  let mutIdx = 0

  for (const coproId of coproIds) {
    const coproLots = await knex('lots')
      .where({ copropriete_id: coproId, type: 'appartement' })
      .select('id', 'coproprietaire_id')
      .orderBy('id')
      .limit(4)

    const coproprietaires = await knex('lots')
      .where({ copropriete_id: coproId })
      .whereNotNull('coproprietaire_id')
      .select('coproprietaire_id')
      .distinct()
      .orderBy('coproprietaire_id')

    for (let m = 0; m < Math.min(2, coproLots.length); m++) {
      const lot = coproLots[m]
      const ancienIdx = (m + 2) % coproprietaires.length
      mutationsData.push({
        lot_id: lot.id,
        ancien_proprietaire_id: coproprietaires[ancienIdx]?.coproprietaire_id || lot.coproprietaire_id,
        nouveau_proprietaire_id: lot.coproprietaire_id,
        date_mutation: `202${4 + (mutIdx % 2)}-${String((mutIdx % 12) + 1).padStart(2, '0')}-${String((mutIdx % 28) + 1).padStart(2, '0')}`,
        type: MUTATION_TYPES[mutIdx % MUTATION_TYPES.length],
        notes: MUTATION_NOTES[mutIdx % MUTATION_NOTES.length],
        created_at: now,
        updated_at: now
      })
      mutIdx++
    }
  }
  await knex('mutations').insert(mutationsData)
}
