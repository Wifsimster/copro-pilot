/**
 * Seed: ensure comprehensive data exists for exports
 * This seed enriches existing data to make PDF/Excel exports meaningful
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Check if appel_fonds_lignes table exists (may not be created yet)
  const hasLignesTable = await knex.schema.hasTable('appel_fonds_lignes')

  if (hasLignesTable) {
    const marker = await knex('appel_fonds_lignes').count('id as cnt').first()
    if (parseInt(marker.cnt) > 50) return
  }

  const copros = await knex('coproprietes').select('id', 'nom').orderBy('id').limit(5)
  if (copros.length === 0) return

  const now = new Date()

  for (const copro of copros) {
    // Get lots with their coproprietaires for this copropriete
    const lots = await knex('lots')
      .select('lots.id', 'lots.numero', 'lots.tantiemes', 'lots.coproprietaire_id')
      .where('lots.copropriete_id', copro.id)
      .orderBy('lots.numero')
      .limit(30)

    if (lots.length === 0) continue

    // Get approved budgets for this copropriete
    const budgets = await knex('budgets_previsionnels')
      .where({ copropriete_id: copro.id })
      .orderBy('annee', 'desc')
      .limit(2)

    for (const budget of budgets) {
      // Make sure each budget has postes
      const existingPostes = await knex('postes_depenses')
        .where('budget_id', budget.id)
        .count('id as cnt')
        .first()

      if (parseInt(existingPostes.cnt) === 0) {
        const totalBudget = parseFloat(budget.montant_total) || 50000
        const postes = [
          { nom: 'Entretien courant et petites reparations', categorie: 'entretien', pct: 0.22 },
          { nom: 'Assurance immeuble (multirisque)', categorie: 'assurance', pct: 0.12 },
          { nom: 'Nettoyage parties communes', categorie: 'entretien', pct: 0.15 },
          { nom: 'Electricite parties communes', categorie: 'energie', pct: 0.08 },
          { nom: 'Eau froide et chaude', categorie: 'energie', pct: 0.10 },
          { nom: 'Chauffage collectif', categorie: 'energie', pct: 0.13 },
          { nom: 'Ascenseur - contrat entretien', categorie: 'equipement', pct: 0.07 },
          { nom: 'Espaces verts', categorie: 'entretien', pct: 0.05 },
          { nom: 'Honoraires syndic', categorie: 'gestion', pct: 0.06 },
          { nom: 'Divers et imprevu', categorie: 'autre', pct: 0.02 },
        ]

        await knex('postes_depenses').insert(
          postes.map((p) => ({
            budget_id: budget.id,
            nom: p.nom,
            categorie: p.categorie,
            montant_prevu: Math.round(totalBudget * p.pct * 100) / 100,
            montant_reel: budget.statut === 'approuve'
              ? Math.round(totalBudget * p.pct * (0.85 + Math.random() * 0.3) * 100) / 100
              : null,
            created_at: now,
            updated_at: now,
          }))
        )
      }
    }

    // Ensure appels de fonds have individual lignes per lot (only if table exists)
    const appels = await knex('appels_fonds')
      .where('copropriete_id', copro.id)
      .orderBy('annee', 'desc')
      .orderBy('trimestre', 'asc')

    if (hasLignesTable) {
      for (const appel of appels) {
        const existingLignes = await knex('appel_fonds_lignes')
          .where('appel_fonds_id', appel.id)
          .count('id as cnt')
          .first()

        if (parseInt(existingLignes.cnt) === 0) {
          const totalTantiemes = lots.reduce((s, l) => s + (l.tantiemes || 0), 0)
          const totalAppel = parseFloat(appel.montant_total) || 10000

          const lignes = lots
            .filter((l) => l.coproprietaire_id)
            .map((l) => ({
              appel_fonds_id: appel.id,
              lot_id: l.id,
              coproprietaire_id: l.coproprietaire_id,
              montant: totalTantiemes > 0
                ? Math.round((l.tantiemes / totalTantiemes) * totalAppel * 100) / 100
                : 0,
              created_at: now,
              updated_at: now,
            }))

          if (lignes.length > 0) {
            // Insert in batches
            for (let i = 0; i < lignes.length; i += 100) {
              await knex('appel_fonds_lignes').insert(lignes.slice(i, i + 100))
            }
          }
        }
      }
    }

    // Ensure paiements exist for some appels
    const appelIds = appels.map((a) => a.id)
    if (appelIds.length > 0 && hasLignesTable) {
      const existingPaiements = await knex('paiements')
        .whereIn('appel_fonds_id', appelIds)
        .count('id as cnt')
        .first()

      if (parseInt(existingPaiements.cnt) === 0) {
        // Create payments for ~70% of lots for older appels
        const olderAppels = appels.filter((a) => a.statut === 'cloture' || a.trimestre <= 2)
        const modes = ['virement', 'cheque', 'prelevement']

        const paiements = []
        for (const appel of olderAppels.slice(0, 3)) {
          const lignes = await knex('appel_fonds_lignes')
            .where('appel_fonds_id', appel.id)
            .whereNotNull('coproprietaire_id')

          for (const ligne of lignes) {
            // 70% pay fully, 15% partial, 15% nothing
            const rand = Math.random()
            if (rand < 0.70) {
              paiements.push({
                coproprietaire_id: ligne.coproprietaire_id,
                appel_fonds_id: appel.id,
                montant: parseFloat(ligne.montant),
                date_paiement: new Date(
                  new Date(appel.date_echeance).getTime() -
                  Math.random() * 15 * 86400000
                ).toISOString().split('T')[0],
                mode: modes[Math.floor(Math.random() * modes.length)],
                reference: `PAY-${appel.annee}-T${appel.trimestre}-${ligne.lot_id}`,
                notes: null,
                created_at: now,
                updated_at: now,
              })
            } else if (rand < 0.85) {
              // Partial payment
              paiements.push({
                coproprietaire_id: ligne.coproprietaire_id,
                appel_fonds_id: appel.id,
                montant: Math.round(parseFloat(ligne.montant) * (0.3 + Math.random() * 0.4) * 100) / 100,
                date_paiement: new Date(
                  new Date(appel.date_echeance).getTime() +
                  Math.random() * 30 * 86400000
                ).toISOString().split('T')[0],
                mode: modes[Math.floor(Math.random() * modes.length)],
                reference: `PAY-${appel.annee}-T${appel.trimestre}-${ligne.lot_id}-PARTIEL`,
                notes: 'Paiement partiel',
                created_at: now,
                updated_at: now,
              })
            }
            // 15% don't pay -> creates impayés
          }
        }

        if (paiements.length > 0) {
          for (let i = 0; i < paiements.length; i += 100) {
            await knex('paiements').insert(paiements.slice(i, i + 100))
          }
        }
      }
    }

    // Ensure carnet d'entretien entries exist
    const existingCarnet = await knex('carnet_entretien')
      .where('copropriete_id', copro.id)
      .count('id as cnt')
      .first()

    if (parseInt(existingCarnet.cnt) < 5) {
      const entries = [
        {
          titre: 'Ravallement de facade',
          description: 'Ravallement complet de la facade principale avec nettoyage et peinture.',
          prestataire: 'BTP Renovation SARL',
          montant: 45000,
          date_realisation: '2024-06-15',
          categorie: 'gros_travaux',
        },
        {
          titre: 'Remplacement chaudiere collective',
          description: 'Installation d\'une chaudiere a condensation haut rendement en remplacement de l\'ancienne.',
          prestataire: 'Chauffage Plus',
          montant: 28000,
          date_realisation: '2024-09-20',
          categorie: 'equipement',
        },
        {
          titre: 'Mise aux normes ascenseur',
          description: 'Mise en conformite de l\'ascenseur selon la reglementation en vigueur.',
          prestataire: 'Ascenseurs Kone',
          montant: 15000,
          date_realisation: '2025-01-10',
          categorie: 'securite',
        },
        {
          titre: 'Etancheite toiture terrasse',
          description: 'Refection de l\'etancheite de la toiture terrasse du batiment B.',
          prestataire: 'Toitures Martin',
          montant: 22000,
          date_realisation: '2025-03-25',
          categorie: 'gros_travaux',
        },
        {
          titre: 'Remplacement digicode et interphone',
          description: 'Installation d\'un systeme de controle d\'acces avec videophone.',
          prestataire: 'SecuriHome',
          montant: 8500,
          date_realisation: '2025-05-12',
          categorie: 'equipement',
        },
        {
          titre: 'Peinture cage d\'escalier',
          description: 'Peinture complete des cages d\'escalier batiment A et B.',
          prestataire: 'Peintres Reunis',
          montant: 6200,
          date_realisation: '2025-07-01',
          categorie: 'entretien',
        },
        {
          titre: 'Contrat entretien espaces verts',
          description: 'Entretien mensuel des espaces verts et jardineres communes.',
          prestataire: 'Jardins Verts',
          montant: 3600,
          date_realisation: '2025-04-01',
          categorie: 'entretien',
        },
        {
          titre: 'Verification extincteurs et colonnes seches',
          description: 'Verification annuelle de tous les equipements de securite incendie.',
          prestataire: 'Securite Incendie Pro',
          montant: 1200,
          date_realisation: '2025-11-15',
          categorie: 'securite',
        },
      ]

      await knex('carnet_entretien').insert(
        entries.map((e) => ({
          copropriete_id: copro.id,
          ...e,
          intervention_id: null,
          created_at: now,
          updated_at: now,
        }))
      )
    }
  }
}
