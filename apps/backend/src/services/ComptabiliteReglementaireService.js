import { ComptabiliteReglementaireModel } from '../models/ComptabiliteReglementaire.js'
import logger from '../logger.js'

const PLAN_COMPTABLE_STANDARD = [
  // Classe 1 - Capitaux
  { code: '102', libelle: 'Provisions pour travaux', classe: 1, type: 'passif' },
  { code: '105', libelle: 'Fonds de travaux (loi ALUR)', classe: 1, type: 'passif' },
  { code: '110', libelle: 'Excédent sur opérations courantes', classe: 1, type: 'passif' },
  { code: '119', libelle: 'Déficit sur opérations courantes', classe: 1, type: 'passif' },
  // Classe 4 - Tiers
  { code: '401', libelle: 'Fournisseurs', classe: 4, type: 'passif' },
  { code: '421', libelle: 'Personnel - Rémunérations dues', classe: 4, type: 'passif' },
  { code: '450', libelle: 'Copropriétaires - Provisions appelées', classe: 4, type: 'actif' },
  { code: '459', libelle: 'Copropriétaires - Créances douteuses', classe: 4, type: 'actif' },
  // Classe 5 - Trésorerie
  { code: '512', libelle: 'Banque - Compte courant', classe: 5, type: 'actif' },
  { code: '514', libelle: 'Banque - Fonds de travaux', classe: 5, type: 'actif' },
  { code: '531', libelle: 'Caisse', classe: 5, type: 'actif' },
  // Classe 6 - Charges
  { code: '601', libelle: 'Eau', classe: 6, type: 'charge' },
  { code: '602', libelle: 'Électricité - Parties communes', classe: 6, type: 'charge' },
  { code: '604', libelle: 'Combustibles et carburants', classe: 6, type: 'charge' },
  { code: '611', libelle: 'Contrats de maintenance', classe: 6, type: 'charge' },
  { code: '614', libelle: 'Assurances', classe: 6, type: 'charge' },
  { code: '615', libelle: 'Entretien et réparations', classe: 6, type: 'charge' },
  { code: '616', libelle: 'Primes assurance multirisques', classe: 6, type: 'charge' },
  { code: '622', libelle: 'Honoraires du syndic', classe: 6, type: 'charge' },
  { code: '625', libelle: 'Frais postaux et télécommunications', classe: 6, type: 'charge' },
  { code: '627', libelle: 'Frais de contentieux', classe: 6, type: 'charge' },
  { code: '628', libelle: 'Divers frais de gestion', classe: 6, type: 'charge' },
  { code: '641', libelle: 'Salaires du personnel', classe: 6, type: 'charge' },
  { code: '645', libelle: 'Charges sociales', classe: 6, type: 'charge' },
  { code: '661', libelle: 'Intérêts des emprunts', classe: 6, type: 'charge' },
  // Classe 7 - Produits
  { code: '701', libelle: 'Provisions sur charges courantes', classe: 7, type: 'produit' },
  { code: '702', libelle: 'Provisions sur travaux', classe: 7, type: 'produit' },
  { code: '703', libelle: 'Cotisations fonds de travaux', classe: 7, type: 'produit' },
  { code: '708', libelle: 'Produits divers', classe: 7, type: 'produit' },
  { code: '761', libelle: 'Intérêts des placements', classe: 7, type: 'produit' },
  { code: '771', libelle: 'Subventions', classe: 7, type: 'produit' },
]

class ComptabiliteReglementaireService {
  // ─── Exercices ─────────────────────────────────────────────

  async getExercicesByCopropriete(coproprieteId) {
    try {
      return await ComptabiliteReglementaireModel.getExercicesByCopropriete(coproprieteId)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting exercices: ${error.message}`)
      throw error
    }
  }

  async getExerciceById(id) {
    try {
      return await ComptabiliteReglementaireModel.getExerciceById(id)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting exercice ${id}: ${error.message}`)
      throw error
    }
  }

  async createExercice(data) {
    try {
      const result = await ComptabiliteReglementaireModel.createExercice(data)
      logger.info(`[ComptaReglService] Exercice créé: ${result.annee} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[ComptaReglService] Error creating exercice: ${error.message}`)
      throw error
    }
  }

  async updateExercice(id, data) {
    try {
      const existing = await ComptabiliteReglementaireModel.getExerciceById(id)
      if (!existing) return null
      const result = await ComptabiliteReglementaireModel.updateExercice(id, data)
      logger.info(`[ComptaReglService] Exercice mis à jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[ComptaReglService] Error updating exercice ${id}: ${error.message}`)
      throw error
    }
  }

  async clotureExercice(id) {
    try {
      const exercice = await ComptabiliteReglementaireModel.getExerciceById(id)
      if (!exercice) return null
      if (exercice.statut === 'cloture') {
        throw new Error('Cet exercice est déjà clôturé')
      }
      // Validate balance is balanced
      const balance = await ComptabiliteReglementaireModel.getBalance(id)
      if (balance && balance.length > 0) {
        const totalDebit = balance.reduce((sum, row) => sum + parseFloat(row.total_debit || 0), 0)
        const totalCredit = balance.reduce((sum, row) => sum + parseFloat(row.total_credit || 0), 0)
        const ecart = Math.abs(totalDebit - totalCredit)
        if (ecart > 0.01) {
          throw new Error(`La balance n'est pas équilibrée (écart: ${ecart.toFixed(2)} EUR)`)
        }
      }
      const result = await ComptabiliteReglementaireModel.clotureExercice(id)
      logger.info(`[ComptaReglService] Exercice clôturé (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[ComptaReglService] Error closing exercice ${id}: ${error.message}`)
      throw error
    }
  }

  // ─── Plan comptable ────────────────────────────────────────

  async getPlanComptable(coproprieteId) {
    try {
      return await ComptabiliteReglementaireModel.getPlanComptable(coproprieteId)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting plan comptable: ${error.message}`)
      throw error
    }
  }

  async getCompte(coproprieteId, code) {
    try {
      return await ComptabiliteReglementaireModel.getCompte(coproprieteId, code)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting compte ${code}: ${error.message}`)
      throw error
    }
  }

  async createCompte(data) {
    try {
      const result = await ComptabiliteReglementaireModel.createCompte(data)
      logger.info(`[ComptaReglService] Compte créé: ${result.code} - ${result.libelle}`)
      return result
    } catch (error) {
      logger.error(`[ComptaReglService] Error creating compte: ${error.message}`)
      throw error
    }
  }

  async updateCompte(id, data) {
    try {
      const result = await ComptabiliteReglementaireModel.updateCompte(id, data)
      logger.info(`[ComptaReglService] Compte mis à jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[ComptaReglService] Error updating compte ${id}: ${error.message}`)
      throw error
    }
  }

  async initialiserPlanComptable(coproprieteId) {
    try {
      const existing = await ComptabiliteReglementaireModel.getPlanComptable(coproprieteId)
      if (existing.length > 0) {
        logger.info(`[ComptaReglService] Plan comptable déjà initialisé pour copropriété ${coproprieteId}`)
        return existing
      }
      const comptes = PLAN_COMPTABLE_STANDARD.map((c) => ({
        ...c,
        copropriete_id: coproprieteId,
        actif: true,
      }))
      const results = []
      for (const compte of comptes) {
        const result = await ComptabiliteReglementaireModel.createCompte(compte)
        results.push(result)
      }
      logger.info(`[ComptaReglService] Plan comptable initialisé: ${results.length} comptes créés pour copropriété ${coproprieteId}`)
      return results
    } catch (error) {
      logger.error(`[ComptaReglService] Error initializing plan comptable: ${error.message}`)
      throw error
    }
  }

  // ─── Ecritures ─────────────────────────────────────────────

  async getEcrituresByExercice(exerciceId) {
    try {
      return await ComptabiliteReglementaireModel.getEcrituresByExercice(exerciceId)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting ecritures for exercice ${exerciceId}: ${error.message}`)
      throw error
    }
  }

  async getEcrituresByCompte(coproprieteId, compteCode, exerciceId) {
    try {
      return await ComptabiliteReglementaireModel.getEcrituresByCompte(coproprieteId, compteCode, exerciceId)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting ecritures for compte ${compteCode}: ${error.message}`)
      throw error
    }
  }

  async createEcriture(data) {
    try {
      const result = await ComptabiliteReglementaireModel.createEcriture(data)
      logger.info(`[ComptaReglService] Écriture créée: ${result.libelle} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[ComptaReglService] Error creating ecriture: ${error.message}`)
      throw error
    }
  }

  async deleteEcriture(id) {
    try {
      await ComptabiliteReglementaireModel.deleteEcriture(id)
      logger.info(`[ComptaReglService] Écriture supprimée (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[ComptaReglService] Error deleting ecriture ${id}: ${error.message}`)
      throw error
    }
  }

  // ─── Journal / Grand Livre / Balance ───────────────────────

  async getJournal(exerciceId, filters) {
    try {
      return await ComptabiliteReglementaireModel.getJournal(exerciceId, filters)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting journal for exercice ${exerciceId}: ${error.message}`)
      throw error
    }
  }

  async getGrandLivre(exerciceId) {
    try {
      return await ComptabiliteReglementaireModel.getGrandLivre(exerciceId)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting grand livre for exercice ${exerciceId}: ${error.message}`)
      throw error
    }
  }

  async getBalance(exerciceId) {
    try {
      return await ComptabiliteReglementaireModel.getBalance(exerciceId)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting balance for exercice ${exerciceId}: ${error.message}`)
      throw error
    }
  }

  // ─── Génération automatique d'écritures ────────────────────

  async genererEcrituresExercice(exerciceId) {
    try {
      // 1. Get exercice to find copropriete_id and annee
      const exercice = await ComptabiliteReglementaireModel.getExerciceById(exerciceId)
      if (!exercice) {
        throw new Error('Exercice non trouvé')
      }
      if (exercice.statut === 'cloture') {
        throw new Error('Impossible de générer des écritures sur un exercice clôturé')
      }

      const { copropriete_id, annee } = exercice

      const ecritures = []

      // 2. Generate ecritures from appels_fonds_lignes (debit 450, credit 701)
      const { default: knexDatabase } = await import('../config/knex-database.js')
      const db = knexDatabase.getKnex()

      const lignesAppels = await db('appels_fonds_lignes')
        .join('appels_fonds', 'appels_fonds_lignes.appel_fonds_id', 'appels_fonds.id')
        .leftJoin('coproprietaires', 'appels_fonds_lignes.coproprietaire_id', 'coproprietaires.id')
        .where('appels_fonds.copropriete_id', copropriete_id)
        .andWhere('appels_fonds.annee', annee)
        .select(
          'appels_fonds_lignes.*',
          'appels_fonds.trimestre',
          'appels_fonds.date_emission',
          'coproprietaires.nom as copro_nom',
          'coproprietaires.prenom as copro_prenom'
        )

      for (const ligne of lignesAppels) {
        const libelle = `Appel T${ligne.trimestre} - ${ligne.copro_nom || ''} ${ligne.copro_prenom || ''}`.trim()
        const dateEcriture = ligne.date_emission || `${annee}-01-01`
        // Debit compte 450 (Copropriétaires)
        ecritures.push({
          exercice_id: exerciceId,
          copropriete_id: copropriete_id,
          date_ecriture: dateEcriture,
          libelle,
          compte_code: '450',
          debit: ligne.montant,
          credit: 0,
          piece_ref: `AF-${ligne.appel_fonds_id}`,
          entite_type: 'appel_fonds_ligne',
          entite_id: ligne.id,
          coproprietaire_id: ligne.coproprietaire_id,
        })
        // Credit compte 701 (Provisions sur charges courantes)
        ecritures.push({
          exercice_id: exerciceId,
          copropriete_id: copropriete_id,
          date_ecriture: dateEcriture,
          libelle,
          compte_code: '701',
          debit: 0,
          credit: ligne.montant,
          piece_ref: `AF-${ligne.appel_fonds_id}`,
          entite_type: 'appel_fonds_ligne',
          entite_id: ligne.id,
          coproprietaire_id: ligne.coproprietaire_id,
        })
      }

      // 4. Generate ecritures from paiements (debit 512, credit 450)
      const paiements = await db('paiements')
        .join('appels_fonds', 'paiements.appel_fonds_id', 'appels_fonds.id')
        .leftJoin('coproprietaires', 'paiements.coproprietaire_id', 'coproprietaires.id')
        .where('appels_fonds.copropriete_id', copropriete_id)
        .andWhere('appels_fonds.annee', annee)
        .select(
          'paiements.*',
          'coproprietaires.nom as copro_nom',
          'coproprietaires.prenom as copro_prenom'
        )

      for (const paiement of paiements) {
        const libelle = `Paiement - ${paiement.copro_nom || ''} ${paiement.copro_prenom || ''}`.trim()
        // Debit compte 512 (Banque)
        ecritures.push({
          exercice_id: exerciceId,
          copropriete_id: copropriete_id,
          date_ecriture: paiement.date_paiement,
          libelle,
          compte_code: '512',
          debit: paiement.montant,
          credit: 0,
          piece_ref: `PAI-${paiement.id}`,
          entite_type: 'paiement',
          entite_id: paiement.id,
          coproprietaire_id: paiement.coproprietaire_id,
        })
        // Credit compte 450 (Copropriétaires)
        ecritures.push({
          exercice_id: exerciceId,
          copropriete_id: copropriete_id,
          date_ecriture: paiement.date_paiement,
          libelle,
          compte_code: '450',
          debit: 0,
          credit: paiement.montant,
          piece_ref: `PAI-${paiement.id}`,
          entite_type: 'paiement',
          entite_id: paiement.id,
          coproprietaire_id: paiement.coproprietaire_id,
        })
      }

      // 5. Generate ecritures from mouvements_bancaires (debit/credit 512)
      const mouvements = await db('mouvements_bancaires')
        .join('comptes_bancaires', 'mouvements_bancaires.compte_id', 'comptes_bancaires.id')
        .where('comptes_bancaires.copropriete_id', copropriete_id)
        .andWhere('mouvements_bancaires.date', '>=', exercice.date_debut)
        .andWhere('mouvements_bancaires.date', '<=', exercice.date_fin)
        .whereNull('mouvements_bancaires.paiement_id')
        .select('mouvements_bancaires.*')

      for (const mouvement of mouvements) {
        if (mouvement.type === 'credit') {
          ecritures.push({
            exercice_id: exerciceId,
            copropriete_id: copropriete_id,
            date_ecriture: mouvement.date,
            libelle: mouvement.libelle || 'Mouvement bancaire',
            compte_code: '512',
            debit: mouvement.montant,
            credit: 0,
            piece_ref: `MVT-${mouvement.id}`,
            entite_type: 'mouvement_bancaire',
            entite_id: mouvement.id,
          })
        } else {
          ecritures.push({
            exercice_id: exerciceId,
            copropriete_id: copropriete_id,
            date_ecriture: mouvement.date,
            libelle: mouvement.libelle || 'Mouvement bancaire',
            compte_code: '512',
            debit: 0,
            credit: mouvement.montant,
            piece_ref: `MVT-${mouvement.id}`,
            entite_type: 'mouvement_bancaire',
            entite_id: mouvement.id,
          })
        }
      }

      // Delete existing + batch insert in a transaction
      let inserted = []
      await db.transaction(async trx => {
        await trx('ecritures_comptables').where('exercice_id', exerciceId).del()
        if (ecritures.length > 0) {
          inserted = await trx('ecritures_comptables').insert(ecritures).returning('*')
        }
      })

      logger.info(`[ComptaReglService] ${inserted.length} écritures générées pour exercice ${exerciceId}`)
      return inserted
    } catch (error) {
      logger.error(`[ComptaReglService] Error generating ecritures for exercice ${exerciceId}: ${error.message}`)
      throw error
    }
  }

  // ─── Annexes ───────────────────────────────────────────────

  async getAnnexe1Data(coproprieteId, annee) {
    try {
      return await ComptabiliteReglementaireModel.getAnnexe1Data(coproprieteId, annee)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting annexe 1: ${error.message}`)
      throw error
    }
  }

  async getAnnexe2Data(coproprieteId) {
    try {
      return await ComptabiliteReglementaireModel.getAnnexe2Data(coproprieteId)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting annexe 2: ${error.message}`)
      throw error
    }
  }

  async getAnnexe3Data(coproprieteId, annee) {
    try {
      return await ComptabiliteReglementaireModel.getAnnexe3Data(coproprieteId, annee)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting annexe 3: ${error.message}`)
      throw error
    }
  }

  async getAnnexe4Data(coproprieteId, annee) {
    try {
      return await ComptabiliteReglementaireModel.getAnnexe4Data(coproprieteId, annee)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting annexe 4: ${error.message}`)
      throw error
    }
  }

  async getAnnexe5Data(coproprieteId, annee) {
    try {
      return await ComptabiliteReglementaireModel.getAnnexe5Data(coproprieteId, annee)
    } catch (error) {
      logger.error(`[ComptaReglService] Error getting annexe 5: ${error.message}`)
      throw error
    }
  }
}

export const comptabiliteReglementaireService = new ComptabiliteReglementaireService()
