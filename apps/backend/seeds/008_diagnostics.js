/**
 * Seed: diagnostics techniques obligatoires
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('diagnostics').count('id as cnt').first()
  if (existing.cnt > 0) return

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id')
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // Each copropriete gets a realistic set of diagnostics
  const DIAGNOSTICS_TEMPLATES = [
    // Copro 1 — Paris, 2003-2005, all diagnostics up to date
    [
      { type: 'dpe', prestataire: 'Bureau Veritas', date_realisation: '2023-05-10', date_validite: '2033-05-10', statut: 'valide', observations: 'Classe C — 125 kWh/m²/an' },
      { type: 'amiante', prestataire: 'Bureau Veritas', date_realisation: '2023-05-10', date_validite: null, statut: 'valide', observations: 'Absence de matériaux amiantés (construction post-1997)' },
      { type: 'plomb', prestataire: 'Bureau Veritas', date_realisation: '2023-05-10', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1949)' },
      { type: 'dtg', prestataire: 'Socotec', date_realisation: '2022-09-15', date_validite: '2032-09-15', statut: 'valide', observations: 'État général satisfaisant, ravalement recommandé sous 5 ans' },
      { type: 'ppt', prestataire: 'Socotec', date_realisation: '2023-01-20', date_validite: '2033-01-20', statut: 'valide', observations: 'Plan pluriannuel de travaux adopté en AG 2023' },
      { type: 'gaz', prestataire: 'Qualigaz', date_realisation: '2024-11-08', date_validite: '2027-11-08', statut: 'valide', observations: 'Installation collective conforme' },
    ],
    // Copro 2 — Lyon, 2010-2012, one diagnostic expiring soon
    [
      { type: 'dpe', prestataire: 'Dekra', date_realisation: '2022-03-18', date_validite: '2032-03-18', statut: 'valide', observations: 'Classe B — 85 kWh/m²/an' },
      { type: 'amiante', prestataire: 'Dekra', date_realisation: '2022-03-18', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1997)' },
      { type: 'plomb', prestataire: 'Dekra', date_realisation: '2022-03-18', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1949)' },
      { type: 'electricite', prestataire: 'Consuel', date_realisation: '2021-06-25', date_validite: '2027-06-25', statut: 'a_renouveler', observations: 'Quelques non-conformités mineures relevées, correction recommandée' },
      { type: 'dtg', prestataire: 'Apave', date_realisation: '2020-11-30', date_validite: '2030-11-30', statut: 'valide', observations: 'Bon état général' },
    ],
    // Copro 3 — Marseille, 1995-1998, some expired
    [
      { type: 'dpe', prestataire: 'Socotec', date_realisation: '2019-04-22', date_validite: '2029-04-22', statut: 'valide', observations: 'Classe D — 195 kWh/m²/an, rénovation énergétique recommandée' },
      { type: 'amiante', prestataire: 'Socotec', date_realisation: '2018-02-14', date_validite: null, statut: 'valide', observations: 'Présence de matériaux amiantés en faux-plafonds — surveillance périodique' },
      { type: 'plomb', prestataire: 'Socotec', date_realisation: '2018-02-14', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1949)' },
      { type: 'dtg', prestataire: 'Bureau Veritas', date_realisation: '2016-07-10', date_validite: '2026-07-10', statut: 'a_renouveler', observations: 'DTG arrivant à expiration, renouvellement à planifier' },
      { type: 'gaz', prestataire: 'Qualigaz', date_realisation: '2020-10-05', date_validite: '2023-10-05', statut: 'expire', observations: 'Diagnostic expiré — renouvellement urgent' },
      { type: 'ppt', prestataire: 'Bureau Veritas', date_realisation: '2024-03-12', date_validite: '2034-03-12', statut: 'valide', observations: 'Plan incluant réfection étanchéité terrasses et ravalement' },
    ],
    // Copro 4 — Bordeaux, 2016-2018, mostly up to date
    [
      { type: 'dpe', prestataire: 'Apave', date_realisation: '2024-01-15', date_validite: '2034-01-15', statut: 'valide', observations: 'Classe A — 45 kWh/m²/an, bâtiment BBC' },
      { type: 'amiante', prestataire: 'Apave', date_realisation: '2024-01-15', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1997)' },
      { type: 'plomb', prestataire: 'Apave', date_realisation: '2024-01-15', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1949)' },
      { type: 'electricite', prestataire: 'Consuel', date_realisation: '2024-06-20', date_validite: '2030-06-20', statut: 'valide', observations: 'Installation conforme' },
    ],
    // Copro 5 — Lille, avant 1949, plomb + amiante concerns
    [
      { type: 'dpe', prestataire: 'Bureau Veritas', date_realisation: '2021-09-08', date_validite: '2031-09-08', statut: 'valide', observations: 'Classe E — 280 kWh/m²/an, isolation à améliorer' },
      { type: 'amiante', prestataire: 'Bureau Veritas', date_realisation: '2019-03-25', date_validite: null, statut: 'valide', observations: 'Matériaux amiantés identifiés dans conduits — plan de retrait en cours' },
      { type: 'plomb', prestataire: 'Bureau Veritas', date_realisation: '2019-03-25', date_validite: null, statut: 'valide', observations: 'Présence de plomb dans peintures parties communes — travaux réalisés' },
      { type: 'dtg', prestataire: 'Dekra', date_realisation: '2017-05-12', date_validite: '2027-05-12', statut: 'a_renouveler', observations: 'Structure saine mais ravalement nécessaire' },
      { type: 'gaz', prestataire: 'Qualigaz', date_realisation: '2022-12-01', date_validite: '2025-12-01', statut: 'expire', observations: 'Diagnostic arrivé à expiration — renouvellement à planifier' },
      { type: 'ppt', prestataire: 'Dekra', date_realisation: '2023-06-15', date_validite: '2033-06-15', statut: 'valide', observations: 'Travaux prioritaires : ravalement, remplacement menuiseries, isolation combles' },
    ],
    // Copro 6 — Nice, 2013-2015, modern building, all up to date
    [
      { type: 'dpe', prestataire: 'Dekra', date_realisation: '2024-02-20', date_validite: '2034-02-20', statut: 'valide', observations: 'Classe B — 78 kWh/m²/an, bonne performance énergétique' },
      { type: 'amiante', prestataire: 'Dekra', date_realisation: '2024-02-20', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1997)' },
      { type: 'plomb', prestataire: 'Dekra', date_realisation: '2024-02-20', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1949)' },
      { type: 'electricite', prestataire: 'Consuel', date_realisation: '2024-05-15', date_validite: '2030-05-15', statut: 'valide', observations: 'Installation conforme aux normes NF C 15-100' },
      { type: 'dtg', prestataire: 'Socotec', date_realisation: '2023-11-10', date_validite: '2033-11-10', statut: 'valide', observations: 'Bon état général, entretien régulier des parties communes' },
    ],
    // Copro 7 — Toulouse, 1920-1925, historic with aging concerns
    [
      { type: 'dpe', prestataire: 'Apave', date_realisation: '2020-06-15', date_validite: '2030-06-15', statut: 'valide', observations: 'Classe D — 210 kWh/m²/an, isolation des combles recommandée' },
      { type: 'amiante', prestataire: 'Apave', date_realisation: '2018-11-20', date_validite: null, statut: 'valide', observations: 'Présence de matériaux amiantés dans les colles de carrelage — mesures conservatoires' },
      { type: 'plomb', prestataire: 'Apave', date_realisation: '2018-11-20', date_validite: null, statut: 'valide', observations: 'Traces de plomb dans peintures anciennes — travaux d\'encapsulage réalisés' },
      { type: 'dtg', prestataire: 'Bureau Veritas', date_realisation: '2019-03-22', date_validite: '2029-03-22', statut: 'valide', observations: 'Structure en briques en bon état, joints de façade à reprendre' },
      { type: 'gaz', prestataire: 'Qualigaz', date_realisation: '2023-09-10', date_validite: '2026-09-10', statut: 'valide', observations: 'Installation collective conforme après remplacement des flexibles' },
      { type: 'ppt', prestataire: 'Bureau Veritas', date_realisation: '2024-01-08', date_validite: '2034-01-08', statut: 'valide', observations: 'Plan incluant ravalement façade brique, remplacement menuiseries bois, ITE pignon' },
    ],
    // Copro 8 — Nantes, 2008-2010, HQE certified
    [
      { type: 'dpe', prestataire: 'Socotec', date_realisation: '2023-07-12', date_validite: '2033-07-12', statut: 'valide', observations: 'Classe B — 90 kWh/m²/an, réseau de chaleur performant' },
      { type: 'amiante', prestataire: 'Socotec', date_realisation: '2023-07-12', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1997)' },
      { type: 'plomb', prestataire: 'Socotec', date_realisation: '2023-07-12', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1949)' },
      { type: 'dtg', prestataire: 'Apave', date_realisation: '2022-04-18', date_validite: '2032-04-18', statut: 'valide', observations: 'État satisfaisant, certification HQE maintenue' },
      { type: 'ppt', prestataire: 'Apave', date_realisation: '2024-06-20', date_validite: '2034-06-20', statut: 'valide', observations: 'Travaux de renouvellement des équipements de chaufferie prévus' },
    ],
    // Copro 9 — Strasbourg, avant 1949, historic concerns
    [
      { type: 'dpe', prestataire: 'Bureau Veritas', date_realisation: '2022-01-15', date_validite: '2032-01-15', statut: 'valide', observations: 'Classe E — 260 kWh/m²/an, passoire thermique, rénovation urgente' },
      { type: 'amiante', prestataire: 'Bureau Veritas', date_realisation: '2020-08-10', date_validite: null, statut: 'valide', observations: 'Flocage amianté dans sous-sol — confinement en place, surveillance annuelle' },
      { type: 'plomb', prestataire: 'Bureau Veritas', date_realisation: '2020-08-10', date_validite: null, statut: 'valide', observations: 'Présence de plomb confirmée, travaux de mise en sécurité réalisés en 2021' },
      { type: 'dtg', prestataire: 'Dekra', date_realisation: '2018-10-05', date_validite: '2028-10-05', statut: 'valide', observations: 'Colombages en bon état après rénovation 2020, toiture à surveiller' },
      { type: 'gaz', prestataire: 'Qualigaz', date_realisation: '2024-03-18', date_validite: '2027-03-18', statut: 'valide', observations: 'Installation mixte gaz/électricité conforme' },
      { type: 'ppt', prestataire: 'Dekra', date_realisation: '2023-09-25', date_validite: '2033-09-25', statut: 'valide', observations: 'ITE côté cour, remplacement fenêtres double vitrage, réfection toiture partielle' },
    ],
    // Copro 10 — Montpellier, 2019-2021, RE2020
    [
      { type: 'dpe', prestataire: 'Apave', date_realisation: '2025-01-10', date_validite: '2035-01-10', statut: 'valide', observations: 'Classe A — 35 kWh/m²/an, bâtiment RE2020, performance exemplaire' },
      { type: 'amiante', prestataire: 'Apave', date_realisation: '2025-01-10', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1997)' },
      { type: 'plomb', prestataire: 'Apave', date_realisation: '2025-01-10', date_validite: null, statut: 'valide', observations: 'Non concerné (construction post-1949)' },
      { type: 'electricite', prestataire: 'Consuel', date_realisation: '2024-12-05', date_validite: '2030-12-05', statut: 'valide', observations: 'Installation neuve conforme, bornes de recharge véhicules électriques' },
    ],
  ]

  const diagnosticsData = []
  for (let i = 0; i < coproIds.length; i++) {
    const templates = DIAGNOSTICS_TEMPLATES[i % DIAGNOSTICS_TEMPLATES.length]
    for (const diag of templates) {
      diagnosticsData.push({
        copropriete_id: coproIds[i],
        type: diag.type,
        prestataire: diag.prestataire,
        date_realisation: diag.date_realisation,
        date_validite: diag.date_validite,
        statut: diag.statut,
        observations: diag.observations,
        document_url: null,
        created_at: now,
        updated_at: now,
      })
    }
  }

  await knex('diagnostics').insert(diagnosticsData)
}
