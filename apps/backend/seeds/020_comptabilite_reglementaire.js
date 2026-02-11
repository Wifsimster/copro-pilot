/**
 * Seed: exercices_comptables, plan_comptable, ecritures_comptables
 * Comptabilite reglementaire (loi ALUR / decret 14 mars 2005)
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('exercices_comptables').first()
  if (existing) return

  const now = new Date()
  const copros = await knex('coproprietes').select('id').orderBy('id').limit(3)
  if (copros.length === 0) return
  const coproIds = copros.map((c) => c.id)

  // ─── Plan comptable normalise copropriete ─────────────────────────────────
  const PLAN_COMPTABLE = [
    { code: '102', libelle: 'Provisions pour travaux', classe: 1, type: 'passif' },
    { code: '105', libelle: 'Fonds de travaux (loi ALUR)', classe: 1, type: 'passif' },
    { code: '110', libelle: 'Excedent sur operations courantes', classe: 1, type: 'passif' },
    { code: '119', libelle: 'Deficit sur operations courantes', classe: 1, type: 'passif' },
    { code: '401', libelle: 'Fournisseurs', classe: 4, type: 'passif' },
    { code: '421', libelle: 'Personnel - Remunerations dues', classe: 4, type: 'passif' },
    { code: '450', libelle: 'Coproprietaires - Provisions appelees', classe: 4, type: 'actif' },
    { code: '459', libelle: 'Coproprietaires - Creances douteuses', classe: 4, type: 'actif' },
    { code: '512', libelle: 'Banque - Compte courant', classe: 5, type: 'actif' },
    { code: '514', libelle: 'Banque - Fonds de travaux', classe: 5, type: 'actif' },
    { code: '531', libelle: 'Caisse', classe: 5, type: 'actif' },
    { code: '601', libelle: 'Eau', classe: 6, type: 'charge' },
    { code: '602', libelle: 'Electricite - Parties communes', classe: 6, type: 'charge' },
    { code: '604', libelle: 'Combustibles et carburants', classe: 6, type: 'charge' },
    { code: '611', libelle: 'Contrats de maintenance', classe: 6, type: 'charge' },
    { code: '614', libelle: 'Assurances', classe: 6, type: 'charge' },
    { code: '615', libelle: 'Entretien et reparations', classe: 6, type: 'charge' },
    { code: '616', libelle: 'Primes assurance multirisques', classe: 6, type: 'charge' },
    { code: '622', libelle: 'Honoraires du syndic', classe: 6, type: 'charge' },
    { code: '625', libelle: 'Frais postaux et telecommunications', classe: 6, type: 'charge' },
    { code: '627', libelle: 'Frais de contentieux', classe: 6, type: 'charge' },
    { code: '628', libelle: 'Divers frais de gestion', classe: 6, type: 'charge' },
    { code: '641', libelle: 'Salaires du personnel', classe: 6, type: 'charge' },
    { code: '645', libelle: 'Charges sociales', classe: 6, type: 'charge' },
    { code: '661', libelle: 'Interets des emprunts', classe: 6, type: 'charge' },
    { code: '701', libelle: 'Provisions sur charges courantes', classe: 7, type: 'produit' },
    { code: '702', libelle: 'Provisions sur travaux', classe: 7, type: 'produit' },
    { code: '703', libelle: 'Cotisations fonds de travaux', classe: 7, type: 'produit' },
    { code: '708', libelle: 'Produits divers', classe: 7, type: 'produit' },
    { code: '761', libelle: 'Interets des placements', classe: 7, type: 'produit' },
    { code: '771', libelle: 'Subventions', classe: 7, type: 'produit' },
  ]

  // ─── Exercices comptables (2 per copropriete) ─────────────────────────────
  const exercicesData = []
  for (const coproId of coproIds) {
    exercicesData.push(
      {
        copropriete_id: coproId,
        annee: 2025,
        date_debut: '2025-01-01',
        date_fin: '2025-12-31',
        statut: 'cloture',
        date_cloture: '2026-01-15',
        notes: 'Exercice cloture - comptes approuves en AG',
        created_at: now,
        updated_at: now,
      },
      {
        copropriete_id: coproId,
        annee: 2026,
        date_debut: '2026-01-01',
        date_fin: '2026-12-31',
        statut: 'ouvert',
        date_cloture: null,
        notes: 'Exercice en cours',
        created_at: now,
        updated_at: now,
      }
    )
  }
  const insertedExercices = await knex('exercices_comptables')
    .insert(exercicesData)
    .returning(['id', 'copropriete_id', 'annee'])

  // ─── Plan comptable (full plan per copropriete) ───────────────────────────
  const planData = []
  for (const coproId of coproIds) {
    for (const compte of PLAN_COMPTABLE) {
      planData.push({
        copropriete_id: coproId,
        code: compte.code,
        libelle: compte.libelle,
        classe: compte.classe,
        type: compte.type,
        actif: true,
        created_at: now,
        updated_at: now,
      })
    }
  }
  await knex('plan_comptable').insert(planData)

  // ─── Ecritures comptables (copropriete 1, exercice 2025 only) ─────────────
  const exercice2025Copro1 = insertedExercices.find(
    (e) => e.copropriete_id === coproIds[0] && e.annee === 2025
  )
  if (!exercice2025Copro1) return

  const exId = exercice2025Copro1.id
  const cpId = coproIds[0]

  // Fetch coproprietaires for copropriete 1 to link some ecritures
  const lots = await knex('lots')
    .select('coproprietaire_id')
    .where('copropriete_id', cpId)
    .whereNotNull('coproprietaire_id')
    .groupBy('coproprietaire_id')
    .orderBy('coproprietaire_id')
    .limit(4)
  const coproprietaireIds = lots.map((l) => l.coproprietaire_id)

  let pieceNum = 1
  const ref = () => `PC-2025-${String(pieceNum++).padStart(4, '0')}`

  const ecritures = [
    // ── Q1: Appel de fonds T1 ────────────────────────────────────
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-01-05',
      libelle: 'Appel de fonds T1 2025', compte_code: '450',
      debit: 7500.00, credit: 0, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: 'Appel trimestriel charges courantes',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-01-05',
      libelle: 'Appel de fonds T1 2025', compte_code: '701',
      debit: 0, credit: 7500.00, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Encaissement T1
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-01-20',
      libelle: 'Encaissement provisions T1 - lot A', compte_code: '512',
      debit: 3800.00, credit: 0, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null,
      coproprietaire_id: coproprietaireIds[0] || null,
      notes: 'Virement recu',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-01-20',
      libelle: 'Encaissement provisions T1 - lot A', compte_code: '450',
      debit: 0, credit: 3800.00, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null,
      coproprietaire_id: coproprietaireIds[0] || null,
      notes: null,
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-01-25',
      libelle: 'Encaissement provisions T1 - lot B', compte_code: '512',
      debit: 3700.00, credit: 0, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null,
      coproprietaire_id: coproprietaireIds[1] || null,
      notes: 'Prelevement automatique',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-01-25',
      libelle: 'Encaissement provisions T1 - lot B', compte_code: '450',
      debit: 0, credit: 3700.00, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null,
      coproprietaire_id: coproprietaireIds[1] || null,
      notes: null,
    },
    // Facture eau Q1
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-02-15',
      libelle: 'Facture Veolia eau T1', compte_code: '601',
      debit: 1250.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Facture trimestrielle eau parties communes',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-02-15',
      libelle: 'Facture Veolia eau T1', compte_code: '512',
      debit: 0, credit: 1250.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },

    // ── Q2: Appel de fonds T2 ────────────────────────────────────
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-04-01',
      libelle: 'Appel de fonds T2 2025', compte_code: '450',
      debit: 7500.00, credit: 0, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: 'Appel trimestriel charges courantes',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-04-01',
      libelle: 'Appel de fonds T2 2025', compte_code: '701',
      debit: 0, credit: 7500.00, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Encaissement T2
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-04-18',
      libelle: 'Encaissement provisions T2', compte_code: '512',
      debit: 7200.00, credit: 0, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null, coproprietaire_id: null,
      notes: 'Encaissement global T2',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-04-18',
      libelle: 'Encaissement provisions T2', compte_code: '450',
      debit: 0, credit: 7200.00, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Prime assurance MRH
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-05-10',
      libelle: 'Prime assurance MRH annuelle', compte_code: '616',
      debit: 3200.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Contrat MRH MAIF ref. 2025-IMM-4521',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-05-10',
      libelle: 'Prime assurance MRH annuelle', compte_code: '512',
      debit: 0, credit: 3200.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Honoraires syndic T1-T2
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-06-30',
      libelle: 'Honoraires syndic S1 2025', compte_code: '622',
      debit: 4500.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Honoraires forfaitaires semestriels',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-06-30',
      libelle: 'Honoraires syndic S1 2025', compte_code: '512',
      debit: 0, credit: 4500.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },

    // ── Q3: Appel de fonds T3 ────────────────────────────────────
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-07-01',
      libelle: 'Appel de fonds T3 2025', compte_code: '450',
      debit: 7500.00, credit: 0, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: 'Appel trimestriel charges courantes',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-07-01',
      libelle: 'Appel de fonds T3 2025', compte_code: '701',
      debit: 0, credit: 7500.00, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Encaissement T3
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-07-22',
      libelle: 'Encaissement provisions T3', compte_code: '512',
      debit: 7500.00, credit: 0, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null, coproprietaire_id: null,
      notes: 'Encaissement global T3',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-07-22',
      libelle: 'Encaissement provisions T3', compte_code: '450',
      debit: 0, credit: 7500.00, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Facture EDF
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-08-05',
      libelle: 'Facture EDF parties communes', compte_code: '602',
      debit: 890.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Electricite halls, escaliers, parking',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-08-05',
      libelle: 'Facture EDF parties communes', compte_code: '512',
      debit: 0, credit: 890.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Entretien chaudiere
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-09-15',
      libelle: 'Entretien chaudiere collective', compte_code: '611',
      debit: 1800.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Contrat maintenance annuel Engie',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-09-15',
      libelle: 'Entretien chaudiere collective', compte_code: '512',
      debit: 0, credit: 1800.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },

    // ── Q4: Appel de fonds T4 ────────────────────────────────────
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-10-01',
      libelle: 'Appel de fonds T4 2025', compte_code: '450',
      debit: 7500.00, credit: 0, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: 'Appel trimestriel charges courantes',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-10-01',
      libelle: 'Appel de fonds T4 2025', compte_code: '701',
      debit: 0, credit: 7500.00, piece_ref: ref(),
      entite_type: 'appel_fonds', entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Encaissement T4
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-10-20',
      libelle: 'Encaissement provisions T4', compte_code: '512',
      debit: 7300.00, credit: 0, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null, coproprietaire_id: null,
      notes: 'Encaissement global T4 (300 EUR impaye)',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-10-20',
      libelle: 'Encaissement provisions T4', compte_code: '450',
      debit: 0, credit: 7300.00, piece_ref: ref(),
      entite_type: 'paiement', entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Reparation urgente ascenseur
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-11-02',
      libelle: 'Reparation urgente ascenseur', compte_code: '615',
      debit: 2400.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Intervention urgente Schindler',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-11-02',
      libelle: 'Reparation urgente ascenseur', compte_code: '512',
      debit: 0, credit: 2400.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Cotisation fonds de travaux annuelle
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-11-15',
      libelle: 'Cotisation fonds de travaux 2025', compte_code: '512',
      debit: 2500.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Versement fonds ALUR',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-11-15',
      libelle: 'Cotisation fonds de travaux 2025', compte_code: '703',
      debit: 0, credit: 2500.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Frais postaux
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-12-01',
      libelle: 'Frais postaux envoi convocations AG', compte_code: '625',
      debit: 185.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Envoi recommandes convocations AG annuelle',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-12-01',
      libelle: 'Frais postaux envoi convocations AG', compte_code: '512',
      debit: 0, credit: 185.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Honoraires syndic S2
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-12-20',
      libelle: 'Honoraires syndic S2 2025', compte_code: '622',
      debit: 4500.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: 'Honoraires forfaitaires semestriels',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-12-20',
      libelle: 'Honoraires syndic S2 2025', compte_code: '512',
      debit: 0, credit: 4500.00, piece_ref: ref(),
      entite_type: null, entite_id: null, coproprietaire_id: null,
      notes: null,
    },
    // Creance douteuse - impaye T4 restant
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-12-31',
      libelle: 'Reclassement creance douteuse', compte_code: '459',
      debit: 200.00, credit: 0, piece_ref: ref(),
      entite_type: null, entite_id: null,
      coproprietaire_id: coproprietaireIds[2] || null,
      notes: 'Impaye T4 - coproprietaire en retard',
    },
    {
      exercice_id: exId, copropriete_id: cpId, date_ecriture: '2025-12-31',
      libelle: 'Reclassement creance douteuse', compte_code: '450',
      debit: 0, credit: 200.00, piece_ref: ref(),
      entite_type: null, entite_id: null,
      coproprietaire_id: coproprietaireIds[2] || null,
      notes: null,
    },
  ]

  // Add timestamps
  const ecrituresData = ecritures.map((e) => ({
    ...e,
    created_at: now,
    updated_at: now,
  }))

  // Insert in batches
  for (let i = 0; i < ecrituresData.length; i += 500) {
    await knex('ecritures_comptables').insert(ecrituresData.slice(i, i + 500))
  }
}
