/**
 * Seed: documents
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  const existing = await knex('documents').first()
  if (existing) return

  const now = new Date()

  // Fetch related entity IDs for linking
  const ags = await knex('assemblees_generales').select('id', 'copropriete_id').orderBy('id')
  const interventions = await knex('interventions').select('id', 'copropriete_id').orderBy('id')
  const contrats = await knex('contrats_syndic').select('id', 'copropriete_id').orderBy('id')

  const agsByCopro = {}
  for (const ag of ags) {
    if (!agsByCopro[ag.copropriete_id]) agsByCopro[ag.copropriete_id] = []
    agsByCopro[ag.copropriete_id].push(ag.id)
  }

  const interventionsByCopro = {}
  for (const i of interventions) {
    if (!interventionsByCopro[i.copropriete_id]) interventionsByCopro[i.copropriete_id] = []
    interventionsByCopro[i.copropriete_id].push(i.id)
  }

  const contratsByCopro = {}
  for (const c of contrats) {
    if (!contratsByCopro[c.copropriete_id]) contratsByCopro[c.copropriete_id] = []
    contratsByCopro[c.copropriete_id].push(c.id)
  }

  const documents = [
    // ── Copropriete 1 ──────────────────────────────────────────────

    // PV d'AG
    {
      copropriete_id: 1,
      nom: 'PV Assemblée Générale Ordinaire - Juin 2025',
      categorie: 'pv_ag',
      fichier_nom: 'pv_ag_ordinaire_2025-06-15.pdf',
      fichier_path: '/uploads/documents/copro1_pv_ag_ordinaire_2025-06-15.pdf',
      mime_type: 'application/pdf',
      taille: 524288,
      description: 'Procès-verbal de l\'assemblée générale ordinaire du 15 juin 2025. Approbation des comptes et vote du budget prévisionnel.',
      entite_type: 'ag',
      entite_id: agsByCopro[1]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Contrat syndic
    {
      copropriete_id: 1,
      nom: 'Contrat de syndic 2025-2028',
      categorie: 'contrat',
      fichier_nom: 'contrat_syndic_2025_2028.pdf',
      fichier_path: '/uploads/documents/copro1_contrat_syndic_2025_2028.pdf',
      mime_type: 'application/pdf',
      taille: 1048576,
      description: 'Contrat de mandat de syndic pour la période 2025-2028, incluant les honoraires et missions.',
      entite_type: 'contrat',
      entite_id: contratsByCopro[1]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Facture intervention
    {
      copropriete_id: 1,
      nom: 'Facture plomberie - Réparation fuite parking',
      categorie: 'facture',
      fichier_nom: 'facture_plomberie_2025-09-12.pdf',
      fichier_path: '/uploads/documents/copro1_facture_plomberie_2025-09-12.pdf',
      mime_type: 'application/pdf',
      taille: 215040,
      description: 'Facture de la société AquaPlomb pour réparation de fuite au niveau du parking souterrain.',
      entite_type: 'intervention',
      entite_id: interventionsByCopro[1]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Devis intervention
    {
      copropriete_id: 1,
      nom: 'Devis ravalement façade nord',
      categorie: 'devis',
      fichier_nom: 'devis_ravalement_facade_nord.pdf',
      fichier_path: '/uploads/documents/copro1_devis_ravalement_facade_nord.pdf',
      mime_type: 'application/pdf',
      taille: 358400,
      description: 'Devis de l\'entreprise BatiRenov pour ravalement de la façade nord, incluant traitement anti-mousse et peinture.',
      entite_type: 'intervention',
      entite_id: interventionsByCopro[1]?.[1] || interventionsByCopro[1]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Diagnostic DPE
    {
      copropriete_id: 1,
      nom: 'Diagnostic de Performance Énergétique (DPE) collectif',
      categorie: 'diagnostic',
      fichier_nom: 'dpe_collectif_2024.pdf',
      fichier_path: '/uploads/documents/copro1_dpe_collectif_2024.pdf',
      mime_type: 'application/pdf',
      taille: 2097152,
      description: 'DPE collectif réalisé par le cabinet DiagExpert en novembre 2024. Classement énergétique D.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Diagnostic amiante
    {
      copropriete_id: 1,
      nom: 'Diagnostic Technique Amiante (DTA)',
      categorie: 'diagnostic',
      fichier_nom: 'dta_2023.pdf',
      fichier_path: '/uploads/documents/copro1_dta_2023.pdf',
      mime_type: 'application/pdf',
      taille: 1572864,
      description: 'Dossier technique amiante mis à jour en 2023. Aucune présence d\'amiante détectée dans les parties communes.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Règlement de copropriété
    {
      copropriete_id: 1,
      nom: 'Règlement de copropriété',
      categorie: 'reglement',
      fichier_nom: 'reglement_copropriete.pdf',
      fichier_path: '/uploads/documents/copro1_reglement_copropriete.pdf',
      mime_type: 'application/pdf',
      taille: 3145728,
      description: 'Règlement de copropriété et état descriptif de division. Document notarié du 12 mars 2010.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Assurance
    {
      copropriete_id: 1,
      nom: 'Attestation assurance multirisque immeuble 2025',
      categorie: 'assurance',
      fichier_nom: 'attestation_assurance_mri_2025.pdf',
      fichier_path: '/uploads/documents/copro1_attestation_assurance_mri_2025.pdf',
      mime_type: 'application/pdf',
      taille: 184320,
      description: 'Attestation d\'assurance multirisque immeuble AXA pour l\'exercice 2025. Garanties : incendie, dégât des eaux, responsabilité civile.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Courrier
    {
      copropriete_id: 1,
      nom: 'Courrier mairie - Autorisation échafaudage',
      categorie: 'courrier',
      fichier_nom: 'courrier_mairie_autorisation_echafaudage.pdf',
      fichier_path: '/uploads/documents/copro1_courrier_mairie_autorisation_echafaudage.pdf',
      mime_type: 'application/pdf',
      taille: 102400,
      description: 'Autorisation d\'occupation du domaine public pour installation d\'échafaudage, délivrée par la mairie.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },

    // ── Copropriete 2 ──────────────────────────────────────────────

    // PV d'AG
    {
      copropriete_id: 2,
      nom: 'PV Assemblée Générale Ordinaire - Juin 2025',
      categorie: 'pv_ag',
      fichier_nom: 'pv_ag_ordinaire_2025-06-15.pdf',
      fichier_path: '/uploads/documents/copro2_pv_ag_ordinaire_2025-06-15.pdf',
      mime_type: 'application/pdf',
      taille: 481280,
      description: 'Procès-verbal de l\'assemblée générale ordinaire du 15 juin 2025. Vote sur le ravalement et remplacement chaudière.',
      entite_type: 'ag',
      entite_id: agsByCopro[2]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Contrat entretien
    {
      copropriete_id: 2,
      nom: 'Contrat d\'entretien ascenseur',
      categorie: 'contrat',
      fichier_nom: 'contrat_entretien_ascenseur_2025.pdf',
      fichier_path: '/uploads/documents/copro2_contrat_entretien_ascenseur_2025.pdf',
      mime_type: 'application/pdf',
      taille: 716800,
      description: 'Contrat d\'entretien annuel de l\'ascenseur avec la société Otis. Visites mensuelles et astreinte 24h/24.',
      entite_type: 'contrat',
      entite_id: contratsByCopro[2]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Facture
    {
      copropriete_id: 2,
      nom: 'Facture nettoyage parties communes - T3 2025',
      categorie: 'facture',
      fichier_nom: 'facture_nettoyage_t3_2025.pdf',
      fichier_path: '/uploads/documents/copro2_facture_nettoyage_t3_2025.pdf',
      mime_type: 'application/pdf',
      taille: 143360,
      description: 'Facture trimestrielle de la société CleanPro pour le nettoyage des parties communes.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Devis
    {
      copropriete_id: 2,
      nom: 'Devis remplacement interphone',
      categorie: 'devis',
      fichier_nom: 'devis_interphone_2025.pdf',
      fichier_path: '/uploads/documents/copro2_devis_interphone_2025.pdf',
      mime_type: 'application/pdf',
      taille: 276480,
      description: 'Devis pour le remplacement du système d\'interphone par un modèle vidéo connecté. Société TélécomPro.',
      entite_type: 'intervention',
      entite_id: interventionsByCopro[2]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Assurance
    {
      copropriete_id: 2,
      nom: 'Police d\'assurance multirisque immeuble 2025',
      categorie: 'assurance',
      fichier_nom: 'police_assurance_mri_2025.pdf',
      fichier_path: '/uploads/documents/copro2_police_assurance_mri_2025.pdf',
      mime_type: 'application/pdf',
      taille: 921600,
      description: 'Police complète d\'assurance multirisque immeuble Allianz pour l\'exercice 2025.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Diagnostic plomb
    {
      copropriete_id: 2,
      nom: 'Constat de Risque d\'Exposition au Plomb (CREP)',
      categorie: 'diagnostic',
      fichier_nom: 'crep_parties_communes_2024.pdf',
      fichier_path: '/uploads/documents/copro2_crep_parties_communes_2024.pdf',
      mime_type: 'application/pdf',
      taille: 1835008,
      description: 'CREP des parties communes réalisé en septembre 2024. Quelques traces de plomb dans les peintures du hall, seuil non dépassé.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Règlement
    {
      copropriete_id: 2,
      nom: 'Modificatif au règlement de copropriété',
      categorie: 'reglement',
      fichier_nom: 'modificatif_reglement_2022.pdf',
      fichier_path: '/uploads/documents/copro2_modificatif_reglement_2022.pdf',
      mime_type: 'application/pdf',
      taille: 512000,
      description: 'Modificatif n°3 au règlement de copropriété portant sur la répartition des charges de chauffage collectif.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Photo sinistre
    {
      copropriete_id: 2,
      nom: 'Photos dégât des eaux - Hall entrée',
      categorie: 'autre',
      fichier_nom: 'photos_degat_eaux_hall.jpg',
      fichier_path: '/uploads/documents/copro2_photos_degat_eaux_hall.jpg',
      mime_type: 'image/jpeg',
      taille: 4194304,
      description: 'Photos du dégât des eaux survenu dans le hall d\'entrée suite à une rupture de canalisation.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },

    // ── Copropriete 3 ──────────────────────────────────────────────

    // PV d'AG
    {
      copropriete_id: 3,
      nom: 'PV Assemblée Générale Ordinaire - Juin 2025',
      categorie: 'pv_ag',
      fichier_nom: 'pv_ag_ordinaire_2025-06-15.pdf',
      fichier_path: '/uploads/documents/copro3_pv_ag_ordinaire_2025-06-15.pdf',
      mime_type: 'application/pdf',
      taille: 614400,
      description: 'Procès-verbal de l\'assemblée générale ordinaire du 15 juin 2025.',
      entite_type: 'ag',
      entite_id: agsByCopro[3]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Contrat
    {
      copropriete_id: 3,
      nom: 'Contrat d\'entretien espaces verts',
      categorie: 'contrat',
      fichier_nom: 'contrat_espaces_verts_2025.pdf',
      fichier_path: '/uploads/documents/copro3_contrat_espaces_verts_2025.pdf',
      mime_type: 'application/pdf',
      taille: 430080,
      description: 'Contrat annuel d\'entretien des espaces verts et jardins communs avec la société VertPaysage.',
      entite_type: 'contrat',
      entite_id: contratsByCopro[3]?.[0] || null,
      created_at: now,
      updated_at: now
    },
    // Facture
    {
      copropriete_id: 3,
      nom: 'Facture électricité parties communes - Septembre 2025',
      categorie: 'facture',
      fichier_nom: 'facture_electricite_sept_2025.pdf',
      fichier_path: '/uploads/documents/copro3_facture_electricite_sept_2025.pdf',
      mime_type: 'application/pdf',
      taille: 92160,
      description: 'Facture EDF pour la consommation électrique des parties communes (éclairage, ascenseur, VMC).',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Diagnostic termites
    {
      copropriete_id: 3,
      nom: 'État relatif à la présence de termites',
      categorie: 'diagnostic',
      fichier_nom: 'diagnostic_termites_2024.pdf',
      fichier_path: '/uploads/documents/copro3_diagnostic_termites_2024.pdf',
      mime_type: 'application/pdf',
      taille: 1253376,
      description: 'État relatif à la présence de termites dans l\'immeuble. Aucune infestation détectée.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Courrier
    {
      copropriete_id: 3,
      nom: 'Mise en demeure copropriétaire - Impayés charges',
      categorie: 'courrier',
      fichier_nom: 'mise_en_demeure_impayes_2025.pdf',
      fichier_path: '/uploads/documents/copro3_mise_en_demeure_impayes_2025.pdf',
      mime_type: 'application/pdf',
      taille: 163840,
      description: 'Courrier de mise en demeure adressé au copropriétaire du lot 12 pour charges impayées depuis le T1 2025.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Plan immeuble (image)
    {
      copropriete_id: 3,
      nom: 'Plan des parties communes - Rez-de-chaussée',
      categorie: 'autre',
      fichier_nom: 'plan_rdc_parties_communes.png',
      fichier_path: '/uploads/documents/copro3_plan_rdc_parties_communes.png',
      mime_type: 'image/png',
      taille: 3670016,
      description: 'Plan d\'architecte du rez-de-chaussée indiquant les parties communes, issues de secours et locaux techniques.',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    },
    // Fiche de sécurité incendie
    {
      copropriete_id: 3,
      nom: 'Rapport de vérification sécurité incendie',
      categorie: 'diagnostic',
      fichier_nom: 'rapport_securite_incendie_2025.pdf',
      fichier_path: '/uploads/documents/copro3_rapport_securite_incendie_2025.pdf',
      mime_type: 'application/pdf',
      taille: 819200,
      description: 'Rapport annuel de vérification des installations de sécurité incendie (extincteurs, désenfumage, alarmes).',
      entite_type: null,
      entite_id: null,
      created_at: now,
      updated_at: now
    }
  ]

  await knex('documents').insert(documents)
}
