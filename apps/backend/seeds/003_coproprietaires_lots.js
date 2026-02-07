const NOMS = [
  'Dupont', 'Martin', 'Bernard', 'Lefèvre', 'Moreau', 'Garcia', 'Roux', 'Petit',
  'Lemoine', 'Dubois', 'Laurent', 'Simon', 'Michel', 'Leroy', 'Thomas', 'Robert',
  'Richard', 'Durand', 'Fournier', 'Lambert', 'Mercier', 'Bonnet', 'François',
  'Martinez', 'Girard', 'Andre', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Chevalier',
  'Robin', 'Clement', 'Morin', 'Nicolas', 'Henry', 'Rousseau', 'Mathieu', 'Gautier',
  'Masson', 'Muller', 'Perrin', 'Denis', 'Duval', 'Fontaine', 'Noel', 'Meyer',
  'Dufour', 'Marchand', 'Blanchard'
]

const PRENOMS = [
  'Jean', 'Sophie', 'Pierre', 'Marie', 'Luc', 'Ana', 'François', 'Claire',
  'Thomas', 'Isabelle', 'Nicolas', 'Camille', 'Julien', 'Nathalie', 'Philippe',
  'Valérie', 'Antoine', 'Sandrine', 'Christophe', 'Céline', 'Sébastien', 'Aurélie',
  'Guillaume', 'Stéphanie', 'David', 'Caroline', 'Olivier', 'Émilie', 'Frédéric',
  'Sylvie', 'Éric', 'Catherine', 'Laurent', 'Hélène', 'Patrick', 'Monique',
  'Alain', 'Martine', 'Gérard', 'Brigitte', 'Yves', 'Élise', 'Marc', 'Delphine',
  'Thierry', 'Véronique', 'Bruno', 'Pascale', 'Rémi', 'Laure'
]

const VILLES = [
  { ville: 'Paris', cp: '75016', rues: ['avenue des Tilleuls', 'rue de Passy', 'boulevard Suchet', 'rue de la Pompe', 'avenue Mozart', 'rue Raynouard', 'rue de Boulainvilliers', 'avenue Paul Doumer'] },
  { ville: 'Lyon', cp: '69003', rues: ['rue de la République', 'cours Lafayette', 'rue Vendôme', 'avenue Maréchal Foch', 'rue Duquesne', 'rue de Bonnel', 'rue Paul Bert'] },
  { ville: 'Marseille', cp: '13008', rues: ['boulevard du Littoral', 'rue Paradis', 'avenue du Prado', 'corniche Kennedy', 'rue Sainte', 'rue de Rome', 'boulevard Michelet'] },
  { ville: 'Bordeaux', cp: '33000', rues: ['quai des Chartrons', 'cours de l\'Intendance', 'rue Sainte-Catherine', 'place Gambetta', 'allées de Tourny', 'cours Victor Hugo', 'rue du Pas-Saint-Georges'] },
  { ville: 'Lille', cp: '59800', rues: ['place aux Oignons', 'rue Esquermoise', 'rue de la Monnaie', 'rue de Gand', 'place du Théâtre', 'rue Nationale', 'rue Faidherbe'] }
]

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

  // Generate 100 unique coproprietaires
  const coproprietaires = []
  const usedEmails = new Set()
  let phoneIdx = 10

  for (let i = 0; i < 100; i++) {
    const nom = NOMS[i % NOMS.length]
    const prenom = PRENOMS[i % PRENOMS.length]
    const v = VILLES[i % VILLES.length]
    const rue = v.rues[i % v.rues.length]
    const numero = (i % 40) + 1

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

  let inserted
  if (existingCoprop.cnt == 0) {
    inserted = await knex('coproprietaires').insert(coproprietaires).returning('id')
  } else {
    inserted = await knex('coproprietaires').select('id').orderBy('id')
  }

  // Get copropriete IDs
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Lot types with typical surfaces
  const LOT_TYPES = [
    { type: 'appartement', surfaces: [32, 42, 48, 55, 62, 68, 72, 78, 85, 95, 110], tantiemesBase: 50 },
    { type: 'parking', surfaces: [12, 13, 14, 15], tantiemesBase: 10 },
    { type: 'cave', surfaces: [5, 6, 7, 8, 10], tantiemesBase: 3 },
    { type: 'commerce', surfaces: [45, 55, 65, 80, 120], tantiemesBase: 70 },
    { type: 'bureau', surfaces: [25, 35, 50, 70], tantiemesBase: 40 }
  ]

  const DESCRIPTIONS = {
    appartement: ['T2 lumineux', 'T3 avec balcon', 'T4 traversant', 'T2 rénové', 'T3 avec terrasse', 'T5 familial', 'T2 sous combles', 'T3 vue dégagée', 'T4 duplex', 'T2 avec loggia'],
    parking: ['Place en sous-sol', 'Box fermé', 'Place extérieure', 'Place double'],
    cave: ['Cave voûtée', 'Cave sèche', 'Cave aménagée', 'Cellier'],
    commerce: ['Local commercial RDC', 'Boutique avec vitrine', 'Local d\'activité'],
    bureau: ['Bureau open space', 'Bureau cloisonné', 'Espace coworking']
  }

  // Prefixes per copropriete for lot numbering
  const PREFIXES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']

  // Generate one lot per coproprietaire, distributed round-robin across coproprietes
  // Track lot counters per copropriete to generate unique numeros
  const lotCounters = {}
  for (const id of coproIds) {
    lotCounters[id] = { appartement: 0, parking: 0, cave: 0, commerce: 0, bureau: 0 }
  }

  const lots = inserted.map((row, i) => {
    const coproId = coproIds[i % coproIds.length]
    const coproIdx = coproIds.indexOf(coproId)
    const prefix = PREFIXES[coproIdx % PREFIXES.length]

    // 75% appartements, 10% parking, 8% cave, 4% commerce, 3% bureau
    let lotType
    const r = i % 100
    if (r < 75) lotType = LOT_TYPES[0]
    else if (r < 85) lotType = LOT_TYPES[1]
    else if (r < 93) lotType = LOT_TYPES[2]
    else if (r < 97) lotType = LOT_TYPES[3]
    else lotType = LOT_TYPES[4]

    const counter = ++lotCounters[coproId][lotType.type]
    const surface = lotType.surfaces[i % lotType.surfaces.length]
    const tantiemes = Math.round(lotType.tantiemesBase * (surface / lotType.surfaces[0]))
    const etage = lotType.type === 'appartement' ? (counter % 6) + 1
      : lotType.type === 'parking' || lotType.type === 'cave' ? -1
      : 0
    const descs = DESCRIPTIONS[lotType.type]
    const description = descs[i % descs.length]

    let numero
    if (lotType.type === 'appartement') numero = `${prefix}-${etage}${String(counter).padStart(2, '0')}`
    else if (lotType.type === 'parking') numero = `P-${prefix}${String(counter).padStart(2, '0')}`
    else if (lotType.type === 'cave') numero = `CV-${prefix}${String(counter).padStart(2, '0')}`
    else if (lotType.type === 'commerce') numero = `COM-${prefix}${String(counter).padStart(2, '0')}`
    else numero = `BUR-${prefix}${String(counter).padStart(2, '0')}`

    return {
      copropriete_id: coproId,
      coproprietaire_id: row.id,
      numero,
      type: lotType.type,
      surface,
      etage,
      tantiemes,
      description,
      created_at: now,
      updated_at: now
    }
  })

  await knex('lots').insert(lots)
}
