const NOMS = [
  'Dupont', 'Martin', 'Bernard', 'Lefèvre', 'Moreau', 'Garcia', 'Roux', 'Petit',
  'Lemoine', 'Dubois', 'Laurent', 'Simon', 'Michel', 'Leroy', 'Thomas', 'Robert',
  'Richard', 'Durand', 'Fournier', 'Lambert', 'Mercier', 'Bonnet', 'François',
  'Martinez', 'Girard', 'Andre', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Chevalier',
  'Robin', 'Clement', 'Morin', 'Nicolas', 'Henry', 'Rousseau', 'Mathieu', 'Gautier',
  'Masson', 'Muller', 'Perrin', 'Denis', 'Duval', 'Fontaine', 'Noel', 'Meyer',
  'Dufour', 'Marchand', 'Blanchard', 'Renaud', 'Fabre', 'Riviere', 'Brun', 'Leclerc',
  'Picard', 'Carpentier', 'Brunet', 'Rey', 'Caron', 'Colin', 'Arnaud', 'Vidal',
  'Meunier', 'Lemaire', 'Renard', 'Gaillard', 'Berger', 'Lacroix', 'Poirier',
  'Bourgeois', 'Legrand', 'Perrot', 'Giraud', 'Barbier', 'Schmitt', 'Roger',
  'Charpentier', 'Da Silva', 'Benoit', 'Boulanger', 'Hubert', 'Deschamps', 'Collet',
  'Pons', 'Martel', 'Maillard', 'Aubry', 'Lecomte', 'Prevost', 'Guillaume',
  'Chartier', 'Barre', 'Fernandez', 'Boucher', 'Delorme', 'Perez', 'Guyot',
  'Da Costa', 'Tessier'
]

const PRENOMS = [
  'Jean', 'Sophie', 'Pierre', 'Marie', 'Luc', 'Ana', 'François', 'Claire',
  'Thomas', 'Isabelle', 'Nicolas', 'Camille', 'Julien', 'Nathalie', 'Philippe',
  'Valérie', 'Antoine', 'Sandrine', 'Christophe', 'Céline', 'Sébastien', 'Aurélie',
  'Guillaume', 'Stéphanie', 'David', 'Caroline', 'Olivier', 'Émilie', 'Frédéric',
  'Sylvie', 'Éric', 'Catherine', 'Laurent', 'Hélène', 'Patrick', 'Monique',
  'Alain', 'Martine', 'Gérard', 'Brigitte', 'Yves', 'Élise', 'Marc', 'Delphine',
  'Thierry', 'Véronique', 'Bruno', 'Pascale', 'Rémi', 'Laure', 'Alexandre',
  'Virginie', 'Benoît', 'Pauline', 'Adrien', 'Charlotte', 'Maxime', 'Marine',
  'Hugo', 'Léa', 'Lucas', 'Manon', 'Nathan', 'Chloé', 'Raphaël', 'Jade',
  'Gabriel', 'Inès', 'Arthur', 'Louise', 'Paul', 'Lina', 'Louis', 'Alice',
  'Jules', 'Zoé', 'Adam', 'Emma', 'Léo', 'Sarah', 'Mathis', 'Juliette',
  'Enzo', 'Margaux', 'Ethan', 'Amélie', 'Théo', 'Diane', 'Clément', 'Agathe',
  'Victor', 'Lucie', 'Bastien', 'Elsa', 'Romain', 'Estelle', 'Quentin', 'Amandine',
  'Damien', 'Noémie'
]

const VILLES = [
  { ville: 'Paris', cp: '75016', rues: ['avenue des Tilleuls', 'rue de Passy', 'boulevard Suchet', 'rue de la Pompe', 'avenue Mozart', 'rue Raynouard', 'rue de Boulainvilliers', 'avenue Paul Doumer'] },
  { ville: 'Lyon', cp: '69003', rues: ['rue de la République', 'cours Lafayette', 'rue Vendôme', 'avenue Maréchal Foch', 'rue Duquesne', 'rue de Bonnel', 'rue Paul Bert'] },
  { ville: 'Marseille', cp: '13008', rues: ['boulevard du Littoral', 'rue Paradis', 'avenue du Prado', 'corniche Kennedy', 'rue Sainte', 'rue de Rome', 'boulevard Michelet'] },
  { ville: 'Bordeaux', cp: '33000', rues: ['quai des Chartrons', 'cours de l\'Intendance', 'rue Sainte-Catherine', 'place Gambetta', 'allées de Tourny', 'cours Victor Hugo', 'rue du Pas-Saint-Georges'] },
  { ville: 'Lille', cp: '59800', rues: ['place aux Oignons', 'rue Esquermoise', 'rue de la Monnaie', 'rue de Gand', 'place du Théâtre', 'rue Nationale', 'rue Faidherbe'] },
  { ville: 'Nice', cp: '06000', rues: ['promenade des Anglais', 'avenue Jean Médecin', 'rue de France', 'boulevard Victor Hugo', 'rue Masséna', 'avenue de Verdun', 'rue Gioffredo'] },
  { ville: 'Toulouse', cp: '31000', rues: ['rue du Taur', 'place du Capitole', 'rue Saint-Rome', 'rue Alsace-Lorraine', 'allées Jean Jaurès', 'rue de Metz', 'boulevard de Strasbourg'] },
  { ville: 'Nantes', cp: '44000', rues: ['quai de la Fosse', 'rue Crébillon', 'place Royale', 'cours des 50 Otages', 'rue de la Marne', 'passage Pommeraye', 'rue Maréchal Joffre'] },
  { ville: 'Strasbourg', cp: '67000', rues: ['rue des Dentelles', 'Grand\'Rue', 'quai des Bateliers', 'rue du Vieux-Marché-aux-Poissons', 'place Kléber', 'rue des Hallebardes', 'rue du Dôme'] },
  { ville: 'Montpellier', cp: '34000', rues: ['avenue de la Mer', 'place de la Comédie', 'rue Foch', 'boulevard du Jeu de Paume', 'rue de l\'Aiguillerie', 'esplanade Charles de Gaulle', 'rue de la Loge'] }
]

// Deterministic coproprietaire counts per copropriete (30-200)
const COPRO_COUNTS = [83, 45, 156, 112, 68, 38, 175, 91, 130, 52]

function generatePhone(index) {
  const n = String(index).padStart(8, '0')
  return `06 ${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)}`
}

function normalizeEmail(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '')
}

async function batchInsert(knex, table, data, chunkSize = 500) {
  for (let i = 0; i < data.length; i += chunkSize) {
    await knex(table).insert(data.slice(i, i + chunkSize))
  }
}

async function batchInsertReturning(knex, table, data, returning, chunkSize = 500) {
  const results = []
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = await knex(table).insert(data.slice(i, i + chunkSize)).returning(returning)
    results.push(...chunk)
  }
  return results
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existingCoprop = await knex('coproprietaires').count('id as cnt').first()
  const existingLots = await knex('lots').count('id as cnt').first()
  if (existingCoprop.cnt > 0 && existingLots.cnt > 0) {
    return
  }

  const now = new Date()

  // Get copropriete IDs
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Calculate counts per copropriete
  const countsPerCopro = coproIds.map((_, idx) => COPRO_COUNTS[idx % COPRO_COUNTS.length])
  const totalNeeded = countsPerCopro.reduce((a, b) => a + b, 0)

  // Generate all unique coproprietaires
  const coproprietaires = []
  const usedEmails = new Set()
  let phoneIdx = 10

  for (let i = 0; i < totalNeeded; i++) {
    const nom = NOMS[i % NOMS.length]
    // Use offset formula to maximize unique (nom, prenom) combinations
    const prenom = PRENOMS[(Math.floor(i / NOMS.length) + i * 3) % PRENOMS.length]
    const v = VILLES[i % VILLES.length]
    const rue = v.rues[i % v.rues.length]
    const numero = (i % 80) + 1

    let emailBase = `${normalizeEmail(prenom)}.${normalizeEmail(nom)}`
    if (usedEmails.has(emailBase)) {
      emailBase += (i + 1)
    }
    usedEmails.add(emailBase)

    coproprietaires.push({
      nom,
      prenom,
      email: `${emailBase}@email.fr`,
      telephone: generatePhone(phoneIdx++),
      adresse_correspondance: `${numero} ${rue}, ${v.cp} ${v.ville}`,
      created_at: now,
      updated_at: now
    })
  }

  // Insert coproprietaires
  let inserted
  if (existingCoprop.cnt == 0) {
    inserted = await batchInsertReturning(knex, 'coproprietaires', coproprietaires, 'id')
  } else {
    inserted = await knex('coproprietaires').select('id').orderBy('id')
  }

  // Lot types with typical surfaces
  const LOT_TYPES = {
    appartement: { surfaces: [32, 42, 48, 55, 62, 68, 72, 78, 85, 95, 110], tantiemesBase: 50 },
    parking: { surfaces: [12, 13, 14, 15], tantiemesBase: 10 },
    cave: { surfaces: [5, 6, 7, 8, 10], tantiemesBase: 3 },
    commerce: { surfaces: [45, 55, 65, 80, 120], tantiemesBase: 70 },
    bureau: { surfaces: [25, 35, 50, 70], tantiemesBase: 40 }
  }

  const DESCRIPTIONS = {
    appartement: ['T2 lumineux', 'T3 avec balcon', 'T4 traversant', 'T2 rénové', 'T3 avec terrasse', 'T5 familial', 'T2 sous combles', 'T3 vue dégagée', 'T4 duplex', 'T2 avec loggia'],
    parking: ['Place en sous-sol', 'Box fermé', 'Place extérieure', 'Place double'],
    cave: ['Cave voûtée', 'Cave sèche', 'Cave aménagée', 'Cellier'],
    commerce: ['Local commercial RDC', 'Boutique avec vitrine', 'Local d\'activité'],
    bureau: ['Bureau open space', 'Bureau cloisonné', 'Espace coworking']
  }

  const PREFIXES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']

  // Generate lots per copropriete
  const lots = []
  let offset = 0

  for (let coproIdx = 0; coproIdx < coproIds.length; coproIdx++) {
    const coproId = coproIds[coproIdx]
    const count = countsPerCopro[coproIdx]
    const prefix = PREFIXES[coproIdx % PREFIXES.length]
    const copropSlice = inserted.slice(offset, offset + count)

    let aptCounter = 0
    let parkingCounter = 0
    let caveCounter = 0
    let comCounter = 0
    let burCounter = 0

    for (let i = 0; i < copropSlice.length; i++) {
      const copropId = copropSlice[i].id

      // Main lot type: 90% apartment, 6% commerce, 4% bureau
      let mainType
      const r = (i + coproIdx * 7) % 100
      if (r < 90) mainType = 'appartement'
      else if (r < 96) mainType = 'commerce'
      else mainType = 'bureau'

      const typeConfig = LOT_TYPES[mainType]
      const surface = typeConfig.surfaces[(i + coproIdx) % typeConfig.surfaces.length]
      const tantiemes = Math.round(typeConfig.tantiemesBase * (surface / typeConfig.surfaces[0]))

      let numero, etage
      if (mainType === 'appartement') {
        aptCounter++
        etage = (aptCounter % 6) + 1
        numero = `${prefix}-${etage}${String(aptCounter).padStart(2, '0')}`
      } else if (mainType === 'commerce') {
        comCounter++
        etage = 0
        numero = `COM-${prefix}${String(comCounter).padStart(2, '0')}`
      } else {
        burCounter++
        etage = 0
        numero = `BUR-${prefix}${String(burCounter).padStart(2, '0')}`
      }

      lots.push({
        copropriete_id: coproId,
        coproprietaire_id: copropId,
        numero,
        type: mainType,
        surface,
        etage,
        tantiemes,
        description: DESCRIPTIONS[mainType][(i + coproIdx) % DESCRIPTIONS[mainType].length],
        created_at: now,
        updated_at: now
      })

      // 35% also get a parking lot
      if ((i * 7 + coproIdx * 3) % 100 < 35) {
        parkingCounter++
        const pSurface = LOT_TYPES.parking.surfaces[i % LOT_TYPES.parking.surfaces.length]
        lots.push({
          copropriete_id: coproId,
          coproprietaire_id: copropId,
          numero: `P-${prefix}${String(parkingCounter).padStart(2, '0')}`,
          type: 'parking',
          surface: pSurface,
          etage: -1,
          tantiemes: LOT_TYPES.parking.tantiemesBase,
          description: DESCRIPTIONS.parking[parkingCounter % DESCRIPTIONS.parking.length],
          created_at: now,
          updated_at: now
        })
      }

      // 20% also get a cave lot
      if ((i * 11 + coproIdx * 5) % 100 < 20) {
        caveCounter++
        const cSurface = LOT_TYPES.cave.surfaces[i % LOT_TYPES.cave.surfaces.length]
        lots.push({
          copropriete_id: coproId,
          coproprietaire_id: copropId,
          numero: `CV-${prefix}${String(caveCounter).padStart(2, '0')}`,
          type: 'cave',
          surface: cSurface,
          etage: -1,
          tantiemes: LOT_TYPES.cave.tantiemesBase,
          description: DESCRIPTIONS.cave[caveCounter % DESCRIPTIONS.cave.length],
          created_at: now,
          updated_at: now
        })
      }
    }

    offset += count
  }

  // Insert lots in batches
  await batchInsert(knex, 'lots', lots)
}
