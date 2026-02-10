/**
 * Seed: notifications
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('notifications').count('id as cnt').first()
  if (existing.cnt > 0) return

  const admin = await knex('user').where({ email: 'admin@copropilot.local' }).first()
  if (!admin) return

  const copros = await knex('coproprietes').select('id', 'nom').orderBy('id')
  if (copros.length === 0) return

  const now = new Date()
  const userId = admin.id

  const notifications = [
    // Incidents
    {
      type: 'incident',
      titre: 'Nouvel incident signale',
      message: `Fuite d'eau au 3e etage de ${copros[0].nom}. Intervention urgente requise.`,
      copropriete_id: copros[0].id,
      lien: '/travaux',
      lu: false,
    },
    {
      type: 'incident',
      titre: 'Incident resolu',
      message: `La panne d'ascenseur a ${copros[0].nom} a ete resolue par Ascenseurs Kone.`,
      copropriete_id: copros[0].id,
      lien: '/travaux',
      lu: true,
    },
    {
      type: 'incident',
      titre: 'Incident critique',
      message: `Infiltration toiture signalee a ${copros[1]?.nom || copros[0].nom}. Degats des eaux en cours.`,
      copropriete_id: copros[1]?.id || copros[0].id,
      lien: '/travaux',
      lu: false,
    },
    {
      type: 'incident',
      titre: 'Nouvel incident : eclairage parking',
      message: 'Plusieurs neons hors service dans le parking souterrain.',
      copropriete_id: copros[0].id,
      lien: '/travaux',
      lu: true,
    },
    // AG
    {
      type: 'ag',
      titre: 'AG ordinaire programmee',
      message: `L'assemblee generale ordinaire de ${copros[0].nom} est prevue le mois prochain.`,
      copropriete_id: copros[0].id,
      lien: '/assemblees',
      lu: false,
    },
    {
      type: 'ag',
      titre: 'Convocations envoyees',
      message: `Les convocations pour l'AG de ${copros[1]?.nom || copros[0].nom} ont ete envoyees.`,
      copropriete_id: copros[1]?.id || copros[0].id,
      lien: '/assemblees',
      lu: true,
    },
    {
      type: 'ag',
      titre: 'Rappel : AG dans 7 jours',
      message: `N'oubliez pas l'assemblee generale extraordinaire de ${copros[0].nom}.`,
      copropriete_id: copros[0].id,
      lien: '/assemblees',
      lu: false,
    },
    {
      type: 'ag',
      titre: 'PV d\'AG disponible',
      message: `Le proces-verbal de l'AG du 15/01 de ${copros[0].nom} est maintenant disponible.`,
      copropriete_id: copros[0].id,
      lien: '/assemblees',
      lu: true,
    },
    // Paiements
    {
      type: 'paiement',
      titre: 'Appel de fonds emis',
      message: `L'appel de fonds du T1 2026 a ete emis pour ${copros[0].nom}.`,
      copropriete_id: copros[0].id,
      lien: '/charges',
      lu: false,
    },
    {
      type: 'paiement',
      titre: 'Paiement recu',
      message: 'Virement de 1 250,00 EUR recu de M. Dupont pour le lot A-101.',
      copropriete_id: copros[0].id,
      lien: '/charges',
      lu: true,
    },
    {
      type: 'paiement',
      titre: 'Retard de paiement',
      message: `3 coproprietaires n'ont pas regle leur appel de fonds T4 2025 pour ${copros[0].nom}.`,
      copropriete_id: copros[0].id,
      lien: '/contentieux',
      lu: false,
    },
    {
      type: 'paiement',
      titre: 'Budget approuve',
      message: `Le budget previsionnel 2026 de ${copros[0].nom} a ete approuve en AG.`,
      copropriete_id: copros[0].id,
      lien: '/charges',
      lu: true,
    },
    // Documents
    {
      type: 'document',
      titre: 'Nouveau document ajoute',
      message: `Le diagnostic DPE de ${copros[0].nom} a ete ajoute aux documents.`,
      copropriete_id: copros[0].id,
      lien: '/documents',
      lu: false,
    },
    {
      type: 'document',
      titre: 'Contrat arrive a echeance',
      message: `Le contrat d'entretien ascenseur de ${copros[1]?.nom || copros[0].nom} expire dans 30 jours.`,
      copropriete_id: copros[1]?.id || copros[0].id,
      lien: '/contrats',
      lu: false,
    },
    {
      type: 'document',
      titre: 'Attestation d\'assurance',
      message: `L'attestation d'assurance multirisque 2026 est disponible pour ${copros[0].nom}.`,
      copropriete_id: copros[0].id,
      lien: '/assurances',
      lu: true,
    },
    // General
    {
      type: 'general',
      titre: 'Bienvenue sur CoproPilot',
      message: 'Votre espace de gestion de copropriete est pret. Commencez par ajouter vos coproprietes.',
      copropriete_id: null,
      lien: '/',
      lu: true,
    },
    {
      type: 'general',
      titre: 'Mise a jour du systeme',
      message: 'CoproPilot a ete mis a jour avec de nouvelles fonctionnalites : gestion des contrats syndic et mise en concurrence.',
      copropriete_id: null,
      lien: null,
      lu: true,
    },
    {
      type: 'general',
      titre: 'Rappel : declarations registre',
      message: 'N\'oubliez pas de soumettre vos declarations annuelles au registre national des coproprietes.',
      copropriete_id: null,
      lien: '/immatriculation',
      lu: false,
    },
    {
      type: 'general',
      titre: 'Sauvegarde automatique',
      message: 'Vos donnees sont automatiquement sauvegardees chaque nuit.',
      copropriete_id: null,
      lien: null,
      lu: true,
    },
    {
      type: 'incident',
      titre: 'Intervention planifiee',
      message: `Entretien annuel chaudiere prevu la semaine prochaine pour ${copros[0].nom}.`,
      copropriete_id: copros[0].id,
      lien: '/travaux',
      lu: false,
    },
  ]

  const data = notifications.map((n, i) => ({
    user_id: userId,
    copropriete_id: n.copropriete_id,
    type: n.type,
    titre: n.titre,
    message: n.message,
    lu: n.lu,
    lien: n.lien,
    created_at: new Date(now.getTime() - i * 3600000 * (2 + Math.random() * 10)),
    updated_at: now,
  }))

  await knex('notifications').insert(data)
}
