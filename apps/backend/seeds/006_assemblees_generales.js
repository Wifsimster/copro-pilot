/**
 * Seed: assemblees_generales, resolutions, presences_ag
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('assemblees_generales').count('id as cnt').first()
  if (existing.cnt > 0) return

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // --- Assemblées générales (2 per copropriete: 1 past terminee, 1 upcoming planifiee) ---
  const agData = []
  for (let idx = 0; idx < coproIds.length; idx++) {
    const coproId = coproIds[idx]
    agData.push(
      {
        copropriete_id: coproId,
        date: '2025-06-15',
        heure: '18:00',
        lieu: 'Salle des fêtes municipale',
        type: 'ordinaire',
        statut: 'terminee',
        date_convocation: '2025-05-15',
        ordre_du_jour: '1. Approbation des comptes 2024\n2. Vote du budget prévisionnel 2026\n3. Travaux de ravalement\n4. Questions diverses',
        notes: 'Quorum atteint. Séance levée à 21h30.',
        created_at: now,
        updated_at: now
      },
      {
        copropriete_id: coproId,
        date: '2026-06-20',
        heure: '18:30',
        lieu: idx % 2 === 0 ? 'Salle polyvalente' : 'Salle de réunion du syndic',
        type: 'ordinaire',
        statut: 'planifiee',
        date_convocation: null,
        ordre_du_jour: '1. Approbation des comptes 2025\n2. Vote du budget prévisionnel 2027\n3. Élection du conseil syndical\n4. Questions diverses',
        notes: null,
        created_at: now,
        updated_at: now
      }
    )
  }
  const insertedAGs = await knex('assemblees_generales').insert(agData).returning(['id', 'copropriete_id', 'statut'])

  // --- Résolutions (4-5 per past AG) ---
  const RESOLUTIONS = [
    { titre: 'Approbation des comptes de l\'exercice écoulé', description: 'Présentation des comptes de charges générales et spéciales de l\'exercice clos au 31 décembre. Le conseil syndical confirme avoir vérifié les comptes et les pièces justificatives.', majorite: 'article_24', resultat: 'adoptee', pour: 850, contre: 50, abst: 100 },
    { titre: 'Vote du budget prévisionnel', description: 'Le budget prévisionnel pour l\'exercice à venir est présenté, détaillant les charges courantes, les provisions pour travaux, et les honoraires du syndic.', majorite: 'article_24', resultat: 'adoptee', pour: 780, contre: 120, abst: 100 },
    { titre: 'Ravalement de façade', description: 'Suite au diagnostic technique réalisé par le cabinet ABC Expertise, il est proposé de procéder au ravalement complet des façades. Trois devis ont été présentés.', majorite: 'article_25', resultat: 'adoptee', pour: 600, contre: 300, abst: 100 },
    { titre: 'Remplacement de la chaudière collective', description: 'Proposition de remplacement de la chaudière collective vétuste par un modèle à condensation haute performance. Coût estimé : 45 000 EUR HT.', majorite: 'article_25', resultat: 'rejetee', pour: 400, contre: 500, abst: 100 },
    { titre: 'Élection des membres du conseil syndical', description: 'Renouvellement des membres du conseil syndical pour un mandat de trois ans. Trois candidatures ont été reçues.', majorite: 'article_24', resultat: 'adoptee', pour: 900, contre: 30, abst: 70 }
  ]

  const resData = []
  const pastAGs = insertedAGs.filter((ag) => ag.statut === 'terminee')
  for (const ag of pastAGs) {
    for (let r = 0; r < RESOLUTIONS.length; r++) {
      const res = RESOLUTIONS[r]
      resData.push({
        ag_id: ag.id,
        numero: r + 1,
        titre: res.titre,
        description: res.description || `Résolution n°${r + 1} soumise au vote`,
        majorite: res.majorite,
        resultat: res.resultat,
        voix_pour: res.pour,
        voix_contre: res.contre,
        abstentions: res.abst,
        created_at: now,
        updated_at: now
      })
    }
  }

  // Planned AGs get draft resolutions (no vote yet)
  const futureAGs = insertedAGs.filter((ag) => ag.statut === 'planifiee')
  for (const ag of futureAGs) {
    const futureRes = [
      { titre: 'Approbation des comptes 2025', majorite: 'article_24' },
      { titre: 'Vote du budget prévisionnel 2027', majorite: 'article_24' },
      { titre: 'Renouvellement du contrat de syndic', majorite: 'article_25' },
      { titre: 'Élection du conseil syndical', majorite: 'article_24' }
    ]
    for (let r = 0; r < futureRes.length; r++) {
      resData.push({
        ag_id: ag.id,
        numero: r + 1,
        titre: futureRes[r].titre,
        description: null,
        majorite: futureRes[r].majorite,
        resultat: null,
        voix_pour: 0,
        voix_contre: 0,
        abstentions: 0,
        created_at: now,
        updated_at: now
      })
    }
  }
  await knex('resolutions').insert(resData)

  // --- Présences AG (for past AGs, attach coproprietaires owning lots in that copropriete) ---
  const lots = await knex('lots').select('coproprietaire_id', 'copropriete_id', 'tantiemes').whereNotNull('coproprietaire_id').orderBy('id')

  // Aggregate tantiemes per coproprietaire per copropriete
  const tantByCoprpCopro = {}
  for (const lot of lots) {
    const key = `${lot.copropriete_id}-${lot.coproprietaire_id}`
    if (!tantByCoprpCopro[key]) {
      tantByCoprpCopro[key] = { copropriete_id: lot.copropriete_id, coproprietaire_id: lot.coproprietaire_id, tantiemes: 0 }
    }
    tantByCoprpCopro[key].tantiemes += lot.tantiemes
  }

  const presData = []
  for (const ag of pastAGs) {
    const entries = Object.values(tantByCoprpCopro).filter((e) => e.copropriete_id === ag.copropriete_id)
    for (let j = 0; j < entries.length; j++) {
      const e = entries[j]
      const statuts = ['present', 'present', 'present', 'absent', 'represente']
      presData.push({
        ag_id: ag.id,
        coproprietaire_id: e.coproprietaire_id,
        statut: statuts[j % statuts.length],
        represente_par_id: statuts[j % statuts.length] === 'represente' ? entries[0].coproprietaire_id : null,
        tantiemes: e.tantiemes,
        created_at: now,
        updated_at: now
      })
    }
  }
  if (presData.length > 0) {
    await knex('presences_ag').insert(presData)
  }
}
