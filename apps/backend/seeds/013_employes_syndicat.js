/**
 * Seed: employes du syndicat
 * Creates employees for each copropriete (gardiens, agents d'entretien, etc.)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('employes_syndicat').del()

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  const POSTES = [
    'Gardien',
    'Concierge',
    'Agent d\'entretien',
    'Jardinier',
    'Agent de sécurité',
    'Employé d\'accueil',
    'Agent technique polyvalent',
    'Femme de ménage',
  ]

  const NOMS = [
    'Dupont', 'Martin', 'Bernard', 'Durand', 'Moreau',
    'Laurent', 'Thomas', 'Petit', 'Robert', 'Richard',
    'Leroy', 'Roux', 'David', 'Bertrand', 'Morel',
    'Fournier', 'Girard', 'Bonnet', 'Lambert', 'Fontaine',
  ]

  const PRENOMS = [
    'Jean', 'Marie', 'Pierre', 'Sophie', 'Michel',
    'Isabelle', 'Philippe', 'Nathalie', 'Alain', 'Catherine',
    'Patrick', 'Sylvie', 'Gérard', 'Monique', 'François',
    'Fatima', 'Carlos', 'Amina', 'Youssef', 'Lucia',
  ]

  const NOTES = [
    'Gardien principal de la résidence. Assure l\'accueil des résidents et la réception des colis. Très apprécié par les copropriétaires.',
    'En charge de l\'entretien quotidien des parties communes : halls, escaliers, local poubelles. Horaires 6h-14h.',
    'Responsable de l\'entretien des espaces verts et de la cour intérieure. Intervient 3 fois par semaine.',
    'Assure la permanence de sécurité en soirée (18h-22h) et le contrôle des accès au parking souterrain.',
    'Poste créé suite à la demande du conseil syndical. Remplacement prévu au départ en retraite.',
    'Convention collective des gardiens et employés d\'immeubles applicable. Coefficient 255.',
    'Contrat saisonnier pour la période estivale : entretien renforcé des espaces verts et nettoyage piscine.',
    'Employé transféré de la copropriété voisine suite à la mutualisation des services de gardiennage.',
    'Logement de fonction au rez-de-chaussée du bâtiment A. Surface : 45 m². Avantage en nature déclaré.',
    'CDD de remplacement pendant le congé maternité de Mme Laurent. Renouvellement possible.',
    'Agent technique polyvalent : petites réparations, suivi des prestataires, relevé des compteurs.',
    'Ancienneté importante dans la résidence. Connaissance approfondie des installations techniques.',
    'Mi-temps thérapeutique depuis janvier 2025. Reprise à temps plein prévue en septembre.',
    'Formation SST (Sauveteur Secouriste du Travail) à jour. Habilitation électrique BR.',
    'Prime d\'ancienneté de 15% applicable. Entretien annuel prévu en mars.',
  ]

  const employeData = []

  // Pre-defined employees per copro to ensure realistic and varied data
  const employeesTemplate = [
    // Copro 1 (grande résidence): gardien + agent entretien + jardinier + agent sécurité
    [
      { posteIdx: 0, typeContrat: 'cdi', dateEmbauche: '2015-09-01', salaire: 2650.00, logement: true },
      { posteIdx: 2, typeContrat: 'cdi', dateEmbauche: '2019-03-15', salaire: 1850.00, logement: false },
      { posteIdx: 3, typeContrat: 'cdd', dateEmbauche: '2025-04-01', salaire: 1650.00, logement: false },
      { posteIdx: 4, typeContrat: 'cdi', dateEmbauche: '2022-06-01', salaire: 2100.00, logement: false },
    ],
    // Copro 2 (moyenne): concierge + agent entretien
    [
      { posteIdx: 1, typeContrat: 'cdi', dateEmbauche: '2018-01-10', salaire: 2450.00, logement: true },
      { posteIdx: 2, typeContrat: 'cdi', dateEmbauche: '2021-09-01', salaire: 1780.00, logement: false },
    ],
    // Copro 3 (grande): gardien + 2 agents entretien + jardinier + agent technique
    [
      { posteIdx: 0, typeContrat: 'cdi', dateEmbauche: '2012-06-15', salaire: 2900.00, logement: true },
      { posteIdx: 2, typeContrat: 'cdi', dateEmbauche: '2020-02-01', salaire: 1820.00, logement: false },
      { posteIdx: 7, typeContrat: 'cdi', dateEmbauche: '2023-05-15', salaire: 1650.00, logement: false },
      { posteIdx: 3, typeContrat: 'saisonnier', dateEmbauche: '2025-05-01', salaire: 1600.00, logement: false, dateFin: '2025-10-31', statut: 'actif' },
      { posteIdx: 6, typeContrat: 'cdi', dateEmbauche: '2017-11-01', salaire: 2350.00, logement: false },
    ],
    // Copro 4 (petite): agent entretien mi-temps
    [
      { posteIdx: 2, typeContrat: 'cdi', dateEmbauche: '2022-10-01', salaire: 950.00, logement: false },
    ],
    // Copro 5 (moyenne): gardien + employé accueil + ancien gardien inactif
    [
      { posteIdx: 0, typeContrat: 'cdi', dateEmbauche: '2020-03-01', salaire: 2550.00, logement: true },
      { posteIdx: 5, typeContrat: 'cdd', dateEmbauche: '2025-01-15', salaire: 1700.00, logement: false, dateFin: '2025-07-14' },
      { posteIdx: 0, typeContrat: 'cdi', dateEmbauche: '2008-04-01', salaire: 2200.00, logement: false, dateFin: '2020-02-28', statut: 'inactif' },
    ],
  ]

  let nameIdx = 0

  for (let coproIdx = 0; coproIdx < coproIds.length; coproIdx++) {
    const coproId = coproIds[coproIdx]
    const template = employeesTemplate[coproIdx % employeesTemplate.length]

    for (let empIdx = 0; empIdx < template.length; empIdx++) {
      const tpl = template[empIdx]
      const nom = NOMS[nameIdx % NOMS.length]
      const prenom = PRENOMS[nameIdx % PRENOMS.length]

      employeData.push({
        copropriete_id: coproId,
        nom,
        prenom,
        poste: POSTES[tpl.posteIdx],
        type_contrat: tpl.typeContrat,
        date_embauche: tpl.dateEmbauche,
        date_fin: tpl.dateFin || null,
        salaire_brut: tpl.salaire,
        logement_fonction: tpl.logement,
        statut: tpl.statut || 'actif',
        notes: NOTES[nameIdx % NOTES.length],
        created_at: now,
        updated_at: now,
      })

      nameIdx++
    }
  }

  if (employeData.length > 0) {
    await knex('employes_syndicat').insert(employeData)
  }
}
