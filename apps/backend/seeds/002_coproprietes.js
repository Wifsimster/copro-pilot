/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('coproprietes').count('id as cnt').first()
  if (existing.cnt > 0) {
    return
  }

  const now = new Date()

  await knex('coproprietes').insert([
    {
      nom: 'Résidence Les Jardins du Parc',
      adresse: '12 avenue des Tilleuls',
      code_postal: '75016',
      ville: 'Paris',
      date_creation: '2005-03-15',
      nombre_lots: 48,
      numero_immatriculation: 'W751012345',
      date_immatriculation: '2017-01-15',
      date_derniere_maj_registre: '2025-03-10',
      nombre_batiments: 3,
      nombre_ascenseurs: 3,
      periode_construction: '2003-2005',
      type_chauffage: 'collectif',
      energie_chauffage: 'gaz',
      notes: 'Copropriété avec espaces verts et parking souterrain',
      created_at: now,
      updated_at: now
    },
    {
      nom: 'Le Clos Saint-Michel',
      adresse: '8 rue de la République',
      code_postal: '69003',
      ville: 'Lyon',
      date_creation: '2012-07-22',
      nombre_lots: 32,
      numero_immatriculation: 'W690054321',
      date_immatriculation: '2017-06-20',
      date_derniere_maj_registre: '2025-04-05',
      nombre_batiments: 2,
      nombre_ascenseurs: 2,
      periode_construction: '2010-2012',
      type_chauffage: 'individuel',
      energie_chauffage: 'electricite',
      notes: 'Résidence récente avec ascenseur et local vélos',
      created_at: now,
      updated_at: now
    },
    {
      nom: 'Domaine de la Corniche',
      adresse: '45 boulevard du Littoral',
      code_postal: '13008',
      ville: 'Marseille',
      date_creation: '1998-11-03',
      nombre_lots: 65,
      numero_immatriculation: 'W130098765',
      date_immatriculation: '2017-03-08',
      date_derniere_maj_registre: '2024-12-15',
      nombre_batiments: 4,
      nombre_ascenseurs: 4,
      periode_construction: '1995-1998',
      type_chauffage: 'collectif',
      energie_chauffage: 'pompe_chaleur',
      notes: 'Vue mer, piscine collective, gardien sur place',
      created_at: now,
      updated_at: now
    },
    {
      nom: 'Les Terrasses de Garonne',
      adresse: '23 quai des Chartrons',
      code_postal: '33000',
      ville: 'Bordeaux',
      date_creation: '2018-02-10',
      nombre_lots: 24,
      numero_immatriculation: 'W330067890',
      date_immatriculation: '2018-09-12',
      date_derniere_maj_registre: '2025-02-28',
      nombre_batiments: 1,
      nombre_ascenseurs: 1,
      periode_construction: '2016-2018',
      type_chauffage: 'individuel',
      energie_chauffage: 'pompe_chaleur',
      notes: 'Bâtiment BBC avec toiture végétalisée',
      created_at: now,
      updated_at: now
    },
    {
      nom: 'Résidence du Vieux-Lille',
      adresse: '5 place aux Oignons',
      code_postal: '59800',
      ville: 'Lille',
      date_creation: '1985-09-28',
      nombre_lots: 18,
      numero_immatriculation: 'W590011223',
      date_immatriculation: '2017-11-30',
      date_derniere_maj_registre: '2025-01-20',
      nombre_batiments: 1,
      nombre_ascenseurs: 0,
      periode_construction: 'avant 1949',
      type_chauffage: 'mixte',
      energie_chauffage: 'gaz',
      notes: 'Immeuble classé, ravalement prévu en 2026',
      created_at: now,
      updated_at: now
    }
  ])
}
