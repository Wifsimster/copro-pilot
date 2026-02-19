import { randomBytes, scryptSync, randomUUID } from 'node:crypto'

/**
 * Hash a password using the same algorithm as Better Auth
 * (scrypt with N=16384, r=16, p=1, dkLen=64)
 */
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const key = scryptSync(password.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  })
  return `${salt}:${key.toString('hex')}`
}

/**
 * Seed: comprehensive extranet copropriétaire data
 *
 * Creates multiple coproprietaire user accounts with varied profiles,
 * links them to existing coproprietaires, seeds notifications,
 * bank accounts, additional appels de fonds and payments so that
 * every extranet endpoint returns rich, realistic data.
 *
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Skip if we already ran this seed (check for our marker users)
  const marker = await knex('user')
    .where('email', 'copro2@copropilot.local')
    .first()
  if (marker) return

  const now = new Date()
  const hashedPassword = hashPassword('copro')

  // ── Gather existing data ──────────────────────────────────────────

  const copros = await knex('coproprietes')
    .select('id', 'nom')
    .orderBy('id')
  if (copros.length < 3) return

  // Get coproprietaires that have no user_id yet
  const available = await knex('coproprietaires')
    .whereNull('user_id')
    .orderBy('id')
  if (available.length < 10) return

  // Get lots grouped by coproprietaire
  const allLots = await knex('lots')
    .select('id', 'copropriete_id', 'coproprietaire_id', 'tantiemes')
    .orderBy('id')
  const lotsByCoprop = {}
  for (const lot of allLots) {
    if (!lot.coproprietaire_id) continue
    if (!lotsByCoprop[lot.coproprietaire_id])
      lotsByCoprop[lot.coproprietaire_id] = []
    lotsByCoprop[lot.coproprietaire_id].push(lot)
  }

  // Get conseil syndical members to identify one for our users
  const conseilMembers = await knex('conseil_syndical')
    .select('coproprietaire_id', 'copropriete_id', 'role')
    .whereNull('date_fin_mandat')
    .orWhere('date_fin_mandat', '>=', now.toISOString().split('T')[0])

  // Find a conseil syndical president from available coproprietaires
  let conseilPresident = null
  for (const member of conseilMembers) {
    if (
      member.role === 'president' &&
      available.some(a => a.id === member.coproprietaire_id)
    ) {
      conseilPresident = member
      break
    }
  }
  // Fallback to any active member
  if (!conseilPresident) {
    for (const member of conseilMembers) {
      if (available.some(a => a.id === member.coproprietaire_id)) {
        conseilPresident = member
        break
      }
    }
  }

  // ── Define user profiles ──────────────────────────────────────────

  // Pick coproprietaires from different copropriétés for variety
  const coproIdSet = new Set()
  const pickedCoproprietaires = []

  // 1) Conseil syndical member first (if found)
  if (conseilPresident) {
    const cp = available.find(
      a => a.id === conseilPresident.coproprietaire_id
    )
    if (cp) {
      pickedCoproprietaires.push({
        coproprietaire: cp,
        email: 'copro2@copropilot.local',
        scenario: 'conseil',
      })
      coproIdSet.add(conseilPresident.copropriete_id)
    }
  }

  // 2-5) Pick from other copropriétés
  const targetEmails = [
    'copro3@copropilot.local',
    'copro4@copropilot.local',
    'copro5@copropilot.local',
    'copro6@copropilot.local',
  ]
  const scenarios = ['standard', 'debtor', 'new_owner', 'multi_lot']

  for (let i = 0; i < targetEmails.length; i++) {
    // Try to pick from a copropriété we haven't used yet
    const candidate = available.find(a => {
      if (pickedCoproprietaires.some(p => p.coproprietaire.id === a.id))
        return false
      const lots = lotsByCoprop[a.id] || []
      if (lots.length === 0) return false
      const coproId = lots[0].copropriete_id
      // Prefer a fresh copropriete, but accept any if needed
      return !coproIdSet.has(coproId) || i >= copros.length - 1
    })

    if (!candidate) continue

    const lots = lotsByCoprop[candidate.id] || []
    if (lots.length > 0) coproIdSet.add(lots[0].copropriete_id)

    pickedCoproprietaires.push({
      coproprietaire: candidate,
      email: targetEmails[i],
      scenario: scenarios[i],
    })
  }

  if (pickedCoproprietaires.length === 0) return

  // ── Create user accounts and link coproprietaires ─────────────────

  const userIds = []

  for (const { coproprietaire, email } of pickedCoproprietaires) {
    const userId = randomUUID()
    const accountId = randomUUID()
    userIds.push({ userId, coproprietaireId: coproprietaire.id, email })

    await knex('user').insert({
      id: userId,
      name: `${coproprietaire.prenom} ${coproprietaire.nom}`,
      email,
      emailVerified: true,
      role: 'coproprietaire',
      isAdmin: false,
      displayName: `${coproprietaire.prenom} ${coproprietaire.nom}`,
      createdAt: now,
      updatedAt: now,
    })

    await knex('account').insert({
      id: accountId,
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    })

    await knex('coproprietaires')
      .where('id', coproprietaire.id)
      .update({ user_id: userId })
  }

  // ── Also link the original copro user to conseil syndical if needed ─
  // Ensure the original copro@copropilot.local user also appears in
  // conseil syndical if they aren't already
  const originalUser = await knex('user')
    .where('email', 'copro@copropilot.local')
    .first()
  if (originalUser) {
    const originalCoprop = await knex('coproprietaires')
      .where('user_id', originalUser.id)
      .first()
    if (originalCoprop) {
      const originalLots = lotsByCoprop[originalCoprop.id] || []
      if (originalLots.length > 0) {
        const coproId = originalLots[0].copropriete_id
        const existingMembership = await knex('conseil_syndical')
          .where({
            coproprietaire_id: originalCoprop.id,
            copropriete_id: coproId,
          })
          .first()

        if (!existingMembership) {
          await knex('conseil_syndical').insert({
            copropriete_id: coproId,
            coproprietaire_id: originalCoprop.id,
            role: 'membre',
            date_election: '2025-06-15',
            date_fin_mandat: '2028-06-15',
            ag_election_id: null,
            notes:
              'Membre élu lors de l\'AG ordinaire de juin 2025. ' +
              'Suit les questions de communication avec les copropriétaires.',
            created_at: now,
            updated_at: now,
          })
        }
      }
    }
  }

  // ── Comptes bancaires (for conseil syndical bank statement view) ───

  const existingAccounts = await knex('comptes_bancaires')
    .count('id as cnt')
    .first()

  if (parseInt(existingAccounts.cnt) === 0) {
    const BANKS = [
      'Crédit Mutuel',
      'BNP Paribas',
      'Société Générale',
      'Caisse d\'Épargne',
      'CIC',
      'Banque Populaire',
      'LCL',
      'Crédit Agricole',
      'La Banque Postale',
      'HSBC France',
    ]

    const comptesData = []

    for (let idx = 0; idx < copros.length; idx++) {
      const copro = copros[idx]
      const bank = BANKS[idx % BANKS.length]
      const ibanBase = String(idx + 1).padStart(4, '0')

      // Compte courant
      comptesData.push({
        copropriete_id: copro.id,
        banque: bank,
        iban: `FR76 3000 4${ibanBase} 0000 0123 4${String(idx + 1).padStart(2, '0')}`,
        bic: `${bank.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}FRPP`,
        type: 'courant',
        libelle: `Compte courant - ${copro.nom}`,
        solde: Math.round((15000 + idx * 3200) * 100) / 100,
        date_ouverture: '2020-01-15',
        actif: true,
        notes: `Compte de gestion courante de la copropriété ${copro.nom}.`,
        created_at: now,
        updated_at: now,
      })

      // Compte fonds travaux
      comptesData.push({
        copropriete_id: copro.id,
        banque: bank,
        iban: `FR76 3000 4${ibanBase} 0000 0567 8${String(idx + 1).padStart(2, '0')}`,
        bic: `${bank.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}FRPP`,
        type: 'fonds_travaux',
        libelle: `Fonds travaux - ${copro.nom}`,
        solde: Math.round((8000 + idx * 1500) * 100) / 100,
        date_ouverture: '2021-03-01',
        actif: true,
        notes:
          'Fonds travaux au titre de l\'article 14-2 de la loi du 10 juillet 1965.',
        created_at: now,
        updated_at: now,
      })
    }

    await knex('comptes_bancaires').insert(comptesData)
  }

  // ── 2026 Q1 appels de fonds (so extranet shows current year data) ──

  const existing2026Appels = await knex('appels_fonds')
    .where('annee', 2026)
    .count('id as cnt')
    .first()

  if (parseInt(existing2026Appels.cnt) === 0) {
    const budgets2026 = await knex('budgets_previsionnels')
      .where('annee', 2026)
      .select('id', 'copropriete_id', 'montant_total')

    const appelsData = []
    for (const budget of budgets2026) {
      const montantTotal = parseFloat(budget.montant_total)
      appelsData.push({
        copropriete_id: budget.copropriete_id,
        budget_id: budget.id,
        trimestre: 1,
        annee: 2026,
        montant_total: Math.round(montantTotal / 4),
        date_emission: '2026-01-05',
        date_echeance: '2026-01-20',
        statut: 'emis',
        created_at: now,
        updated_at: now,
      })
    }

    if (appelsData.length > 0) {
      const insertedAppels = await knex('appels_fonds')
        .insert(appelsData)
        .returning(['id', 'copropriete_id', 'montant_total'])

      // Create lignes for these appels
      const lotsByCopro = {}
      for (const lot of allLots) {
        if (!lotsByCopro[lot.copropriete_id])
          lotsByCopro[lot.copropriete_id] = []
        lotsByCopro[lot.copropriete_id].push(lot)
      }

      const lignesData = []
      for (const appel of insertedAppels) {
        const coproLots = lotsByCopro[appel.copropriete_id] || []
        const totalTantiemes = coproLots.reduce(
          (sum, l) => sum + l.tantiemes,
          0
        )
        if (totalTantiemes === 0) continue

        for (const lot of coproLots) {
          if (!lot.coproprietaire_id) continue
          lignesData.push({
            appel_fonds_id: appel.id,
            lot_id: lot.id,
            coproprietaire_id: lot.coproprietaire_id,
            montant:
              Math.round(
                ((appel.montant_total * lot.tantiemes) / totalTantiemes) *
                  100
              ) / 100,
            created_at: now,
            updated_at: now,
          })
        }
      }

      for (let i = 0; i < lignesData.length; i += 500) {
        await knex('appels_fonds_lignes').insert(
          lignesData.slice(i, i + 500)
        )
      }
    }
  }

  // ── Q3 2025 payments for our linked users (varied statuses) ────────

  const appelsQ3 = await knex('appels_fonds')
    .where({ annee: 2025, trimestre: 3 })
    .select('id', 'copropriete_id', 'montant_total')

  const appelQ3Index = {}
  for (const a of appelsQ3) appelQ3Index[a.copropriete_id] = a

  const paiementsData = []
  const MODES = ['virement', 'prelevement', 'cheque', 'virement']

  for (let i = 0; i < userIds.length; i++) {
    const { coproprietaireId } = userIds[i]
    const scenario = pickedCoproprietaires[i]?.scenario
    const lots = lotsByCoprop[coproprietaireId] || []

    for (const lot of lots) {
      const appel = appelQ3Index[lot.copropriete_id]
      if (!appel) continue

      const coproLots = allLots.filter(
        l => l.copropriete_id === lot.copropriete_id
      )
      const totalTantiemes = coproLots.reduce(
        (sum, l) => sum + l.tantiemes,
        0
      )
      if (totalTantiemes === 0) continue

      const montant =
        Math.round(
          ((appel.montant_total * lot.tantiemes) / totalTantiemes) * 100
        ) / 100

      // Check if payment already exists for this lot/appel
      const existingPayment = await knex('paiements')
        .where({
          coproprietaire_id: coproprietaireId,
          appel_fonds_id: appel.id,
        })
        .first()
      if (existingPayment) continue

      if (scenario === 'debtor') {
        // Debtor: partial payment on Q3, nothing on Q4
        paiementsData.push({
          coproprietaire_id: coproprietaireId,
          appel_fonds_id: appel.id,
          montant: Math.round(montant * 0.4 * 100) / 100,
          date_paiement: '2025-08-12',
          mode: 'cheque',
          reference: `PAY-2025-Q3-PART-${lot.id}`,
          notes: 'Paiement partiel',
          created_at: now,
          updated_at: now,
        })
      } else {
        // Normal: full Q3 payment
        paiementsData.push({
          coproprietaire_id: coproprietaireId,
          appel_fonds_id: appel.id,
          montant,
          date_paiement: `2025-07-${String(5 + (i % 20)).padStart(2, '0')}`,
          mode: MODES[i % MODES.length],
          reference: `PAY-2025-Q3-${lot.id}`,
          notes: null,
          created_at: now,
          updated_at: now,
        })
      }
    }
  }

  if (paiementsData.length > 0) {
    for (let i = 0; i < paiementsData.length; i += 500) {
      await knex('paiements').insert(paiementsData.slice(i, i + 500))
    }
  }

  // ── Notifications for coproprietaire users ─────────────────────────

  const notificationsData = []

  for (const { userId, email } of userIds) {
    const lots = await knex('lots')
      .select('lots.copropriete_id', 'coproprietes.nom as copropriete_nom')
      .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
      .join('coproprietaires', 'lots.coproprietaire_id', 'coproprietaires.id')
      .where('coproprietaires.user_id', userId)
      .groupBy('lots.copropriete_id', 'coproprietes.nom')

    if (lots.length === 0) continue

    const coproNom = lots[0].copropriete_nom
    const coproId = lots[0].copropriete_id

    // Each copro user gets a set of extranet-relevant notifications
    const userNotifications = [
      {
        type: 'paiement',
        titre: 'Appel de fonds T1 2026 disponible',
        message:
          `Votre appel de fonds du 1er trimestre 2026 pour ${coproNom} ` +
          'est disponible dans votre espace copropriétaire.',
        copropriete_id: coproId,
        lien: '/extranet/mes-appels-fonds',
        lu: false,
      },
      {
        type: 'ag',
        titre: 'Assemblée générale à venir',
        message:
          `Une assemblée générale est programmée pour ${coproNom}. ` +
          'Consultez l\'ordre du jour dans votre espace documents.',
        copropriete_id: coproId,
        lien: '/extranet/documents',
        lu: false,
      },
      {
        type: 'document',
        titre: 'Nouveau PV d\'AG disponible',
        message:
          'Le procès-verbal de la dernière assemblée générale ' +
          `de ${coproNom} est désormais consultable.`,
        copropriete_id: coproId,
        lien: '/extranet/documents',
        lu: true,
      },
      {
        type: 'paiement',
        titre: 'Paiement T3 2025 confirmé',
        message:
          'Votre paiement pour le 3e trimestre 2025 a bien été enregistré. ' +
          'Consultez votre relevé de compte.',
        copropriete_id: coproId,
        lien: '/extranet/mon-compte',
        lu: true,
      },
      {
        type: 'incident',
        titre: 'Incident signalé dans votre copropriété',
        message:
          `Un nouvel incident a été signalé à ${coproNom}. ` +
          'Suivez son avancement depuis votre tableau de bord.',
        copropriete_id: coproId,
        lien: '/extranet/dashboard',
        lu: false,
      },
      {
        type: 'general',
        titre: 'Bienvenue sur votre espace copropriétaire',
        message:
          'Votre espace extranet est actif. Vous pouvez consulter ' +
          'vos charges, documents et informations de copropriété.',
        copropriete_id: null,
        lien: '/extranet/dashboard',
        lu: true,
      },
      {
        type: 'document',
        titre: 'Attestation d\'assurance mise à jour',
        message:
          `L'attestation d'assurance multirisque 2026 de ${coproNom} ` +
          'est disponible dans l\'espace documents.',
        copropriete_id: coproId,
        lien: '/extranet/documents',
        lu: false,
      },
      {
        type: 'paiement',
        titre: 'Rappel : appel de fonds T4 2025',
        message:
          'Le règlement de votre appel de fonds du 4e trimestre 2025 ' +
          `pour ${coproNom} est attendu avant le 15 octobre.`,
        copropriete_id: coproId,
        lien: '/extranet/mes-charges',
        lu: false,
      },
    ]

    for (let n = 0; n < userNotifications.length; n++) {
      const notif = userNotifications[n]
      notificationsData.push({
        user_id: userId,
        copropriete_id: notif.copropriete_id,
        type: notif.type,
        titre: notif.titre,
        message: notif.message,
        lu: notif.lu,
        lien: notif.lien,
        created_at: new Date(
          now.getTime() - n * 3600000 * (4 + n * 2)
        ),
        updated_at: now,
      })
    }
  }

  // Also add notifications for the original copro@copropilot.local user
  if (originalUser) {
    const originalLots = await knex('lots')
      .select('lots.copropriete_id', 'coproprietes.nom as copropriete_nom')
      .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
      .join(
        'coproprietaires',
        'lots.coproprietaire_id',
        'coproprietaires.id'
      )
      .where('coproprietaires.user_id', originalUser.id)
      .groupBy('lots.copropriete_id', 'coproprietes.nom')

    if (originalLots.length > 0) {
      const coproNom = originalLots[0].copropriete_nom
      const coproId = originalLots[0].copropriete_id

      const originalNotifs = [
        {
          type: 'paiement',
          titre: 'Appel de fonds T1 2026',
          message:
            `Votre appel de fonds du 1er trimestre 2026 pour ${coproNom} ` +
            'est disponible.',
          copropriete_id: coproId,
          lien: '/extranet/mes-appels-fonds',
          lu: false,
        },
        {
          type: 'ag',
          titre: 'Prochaine AG programmée',
          message:
            `L'assemblée générale ordinaire de ${coproNom} est prévue ` +
            'prochainement. Consultez votre convocation.',
          copropriete_id: coproId,
          lien: '/extranet/documents',
          lu: false,
        },
        {
          type: 'incident',
          titre: 'Intervention en cours',
          message:
            `Une intervention est en cours à ${coproNom} suite ` +
            'à un incident signalé. Suivez l\'avancement.',
          copropriete_id: coproId,
          lien: '/extranet/dashboard',
          lu: false,
        },
        {
          type: 'general',
          titre: 'Mise à jour de votre espace',
          message:
            'De nouvelles fonctionnalités sont disponibles dans votre ' +
            'espace copropriétaire : consultez vos fonds travaux.',
          copropriete_id: null,
          lien: '/extranet/mon-fonds-travaux',
          lu: true,
        },
        {
          type: 'document',
          titre: 'Règlement de copropriété mis à jour',
          message:
            'Le règlement de copropriété modifié suite à la dernière ' +
            `AG de ${coproNom} est disponible.`,
          copropriete_id: coproId,
          lien: '/extranet/documents',
          lu: false,
        },
        {
          type: 'paiement',
          titre: 'Solde de charges à jour',
          message:
            'Votre solde de charges est à jour. Consultez le détail ' +
            'dans votre espace Mon compte.',
          copropriete_id: coproId,
          lien: '/extranet/mon-compte',
          lu: true,
        },
      ]

      for (let n = 0; n < originalNotifs.length; n++) {
        const notif = originalNotifs[n]
        notificationsData.push({
          user_id: originalUser.id,
          copropriete_id: notif.copropriete_id,
          type: notif.type,
          titre: notif.titre,
          message: notif.message,
          lu: notif.lu,
          lien: notif.lien,
          created_at: new Date(
            now.getTime() - n * 3600000 * (3 + n * 2)
          ),
          updated_at: now,
        })
      }
    }
  }

  if (notificationsData.length > 0) {
    await knex('notifications').insert(notificationsData)
  }

  // ── Documents for copropriétés 4-10 (019 only covers 1-3) ─────────

  const existingDocCopros = await knex('documents')
    .distinct('copropriete_id')
    .pluck('copropriete_id')

  const missingDocCopros = copros.filter(
    c => !existingDocCopros.includes(c.id)
  )

  if (missingDocCopros.length > 0) {
    const docsData = []

    for (const copro of missingDocCopros) {
      const cId = copro.id
      const prefix = `copro${cId}`

      docsData.push(
        {
          copropriete_id: cId,
          nom: 'Règlement de copropriété',
          categorie: 'reglement',
          fichier_nom: 'reglement_copropriete.pdf',
          fichier_path: `/uploads/documents/${prefix}_reglement_copropriete.pdf`,
          mime_type: 'application/pdf',
          taille: 2621440 + cId * 102400,
          description:
            `Règlement de copropriété et état descriptif de division de ${copro.nom}. ` +
            'Document notarié.',
          entite_type: null,
          entite_id: null,
          created_at: now,
          updated_at: now,
        },
        {
          copropriete_id: cId,
          nom: 'Diagnostic de Performance Énergétique (DPE)',
          categorie: 'diagnostic',
          fichier_nom: 'dpe_collectif_2024.pdf',
          fichier_path: `/uploads/documents/${prefix}_dpe_collectif_2024.pdf`,
          mime_type: 'application/pdf',
          taille: 1835008,
          description:
            `DPE collectif de ${copro.nom} réalisé en 2024.`,
          entite_type: null,
          entite_id: null,
          created_at: now,
          updated_at: now,
        },
        {
          copropriete_id: cId,
          nom: 'Attestation assurance multirisque immeuble 2025',
          categorie: 'assurance',
          fichier_nom: 'attestation_assurance_mri_2025.pdf',
          fichier_path: `/uploads/documents/${prefix}_attestation_assurance_mri_2025.pdf`,
          mime_type: 'application/pdf',
          taille: 204800,
          description:
            `Attestation d'assurance multirisque immeuble pour ${copro.nom}, ` +
            'exercice 2025.',
          entite_type: null,
          entite_id: null,
          created_at: now,
          updated_at: now,
        },
        {
          copropriete_id: cId,
          nom: 'Contrat de syndic 2025-2028',
          categorie: 'contrat',
          fichier_nom: 'contrat_syndic_2025_2028.pdf',
          fichier_path: `/uploads/documents/${prefix}_contrat_syndic_2025_2028.pdf`,
          mime_type: 'application/pdf',
          taille: 921600,
          description:
            `Contrat de mandat de syndic pour ${copro.nom}, ` +
            'période 2025-2028.',
          entite_type: null,
          entite_id: null,
          created_at: now,
          updated_at: now,
        },
        {
          copropriete_id: cId,
          nom: 'Carnet d\'entretien de l\'immeuble',
          categorie: 'reglement',
          fichier_nom: 'carnet_entretien.pdf',
          fichier_path: `/uploads/documents/${prefix}_carnet_entretien.pdf`,
          mime_type: 'application/pdf',
          taille: 1572864,
          description:
            `Carnet d'entretien mis à jour de ${copro.nom}. ` +
            'Historique des travaux et interventions.',
          entite_type: null,
          entite_id: null,
          created_at: now,
          updated_at: now,
        }
      )
    }

    for (let i = 0; i < docsData.length; i += 500) {
      await knex('documents').insert(docsData.slice(i, i + 500))
    }
  }
}
