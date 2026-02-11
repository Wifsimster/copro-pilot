import { comptabiliteReglementaireService } from '../services/ComptabiliteReglementaireService.js'
import logger from '../logger.js'

export class ComptabiliteReglementaireController {
  // ─── Exercices ─────────────────────────────────────────────

  static async getExercices(req, res) {
    try {
      const { coproprieteId } = req.params
      const exercices = await comptabiliteReglementaireService.getExercicesByCopropriete(coproprieteId)
      res.json({ data: exercices })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting exercices: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les exercices comptables' })
    }
  }

  static async getExercice(req, res) {
    try {
      const { id } = req.params
      const exercice = await comptabiliteReglementaireService.getExerciceById(id)
      if (!exercice) return res.status(404).json({ error: 'Exercice non trouvé' })
      res.json({ data: exercice })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting exercice: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer l\'exercice comptable' })
    }
  }

  static async createExercice(req, res) {
    try {
      const { copropriete_id, annee, date_debut, date_fin } = req.body
      if (!copropriete_id || !annee || !date_debut || !date_fin) {
        return res.status(400).json({ error: 'Les champs copropriete_id, annee, date_debut et date_fin sont obligatoires' })
      }
      const result = await comptabiliteReglementaireService.createExercice(req.body)
      res.status(201).json({ data: result, message: 'Exercice comptable créé avec succès' })
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Un exercice existe déjà pour cette copropriété et cette année' })
      }
      logger.error(`[ComptaReglCtrl] Error creating exercice: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer l\'exercice comptable' })
    }
  }

  static async clotureExercice(req, res) {
    try {
      const { id } = req.params
      const result = await comptabiliteReglementaireService.clotureExercice(id)
      if (!result) return res.status(404).json({ error: 'Exercice non trouvé' })
      res.json({ data: result, message: 'Exercice clôturé avec succès' })
    } catch (error) {
      if (error.message.includes('déjà clôturé') || error.message.includes('balance')) {
        return res.status(400).json({ error: error.message })
      }
      logger.error(`[ComptaReglCtrl] Error closing exercice: ${error.message}`)
      res.status(500).json({ error: 'Impossible de clôturer l\'exercice' })
    }
  }

  // ─── Plan comptable ────────────────────────────────────────

  static async getPlanComptable(req, res) {
    try {
      const { coproprieteId } = req.params
      const comptes = await comptabiliteReglementaireService.getPlanComptable(coproprieteId)
      res.json({ data: comptes })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting plan comptable: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le plan comptable' })
    }
  }

  static async initialiserPlanComptable(req, res) {
    try {
      const { copropriete_id } = req.body
      if (!copropriete_id) {
        return res.status(400).json({ error: 'Le champ copropriete_id est obligatoire' })
      }
      const result = await comptabiliteReglementaireService.initialiserPlanComptable(copropriete_id)
      res.status(201).json({ data: result, message: 'Plan comptable initialisé avec succès' })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error initializing plan comptable: ${error.message}`)
      res.status(500).json({ error: 'Impossible d\'initialiser le plan comptable' })
    }
  }

  static async createCompte(req, res) {
    try {
      const { copropriete_id, code, libelle, classe, type } = req.body
      if (!copropriete_id || !code || !libelle || !classe || !type) {
        return res.status(400).json({ error: 'Les champs copropriete_id, code, libelle, classe et type sont obligatoires' })
      }
      const result = await comptabiliteReglementaireService.createCompte(req.body)
      res.status(201).json({ data: result, message: 'Compte créé avec succès' })
    } catch (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Ce code de compte existe déjà pour cette copropriété' })
      }
      logger.error(`[ComptaReglCtrl] Error creating compte: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer le compte' })
    }
  }

  static async updateCompte(req, res) {
    try {
      const { id } = req.params
      const result = await comptabiliteReglementaireService.updateCompte(id, req.body)
      if (!result) return res.status(404).json({ error: 'Compte non trouvé' })
      res.json({ data: result, message: 'Compte mis à jour avec succès' })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error updating compte: ${error.message}`)
      res.status(500).json({ error: 'Impossible de mettre à jour le compte' })
    }
  }

  // ─── Journal / Grand Livre / Balance ───────────────────────

  static async getJournal(req, res) {
    try {
      const { exerciceId } = req.params
      const { dateDebut, dateFin, compteCode } = req.query
      const journal = await comptabiliteReglementaireService.getJournal(exerciceId, {
        dateDebut,
        dateFin,
        compteCode,
      })
      res.json({ data: journal })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting journal: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le journal' })
    }
  }

  static async getGrandLivre(req, res) {
    try {
      const { exerciceId } = req.params
      const grandLivre = await comptabiliteReglementaireService.getGrandLivre(exerciceId)
      res.json({ data: grandLivre })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting grand livre: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer le grand livre' })
    }
  }

  static async getBalance(req, res) {
    try {
      const { exerciceId } = req.params
      const balance = await comptabiliteReglementaireService.getBalance(exerciceId)
      if (!balance) return res.status(404).json({ error: 'Exercice non trouvé' })
      res.json({ data: balance })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting balance: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer la balance' })
    }
  }

  // ─── Ecritures ─────────────────────────────────────────────

  static async createEcriture(req, res) {
    try {
      const { exercice_id, copropriete_id, date_ecriture, libelle, compte_code } = req.body
      if (!exercice_id || !copropriete_id || !date_ecriture || !libelle || !compte_code) {
        return res.status(400).json({
          error: 'Les champs exercice_id, copropriete_id, date_ecriture, libelle et compte_code sont obligatoires',
        })
      }
      const { debit, credit } = req.body
      if ((!debit || debit === 0) && (!credit || credit === 0)) {
        return res.status(400).json({ error: 'Au moins un montant (debit ou credit) doit être renseigné' })
      }
      const result = await comptabiliteReglementaireService.createEcriture(req.body)
      res.status(201).json({ data: result, message: 'Écriture comptable créée avec succès' })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error creating ecriture: ${error.message}`)
      res.status(500).json({ error: 'Impossible de créer l\'écriture comptable' })
    }
  }

  static async genererEcritures(req, res) {
    try {
      const { exerciceId } = req.params
      const ecritures = await comptabiliteReglementaireService.genererEcrituresExercice(exerciceId)
      res.json({
        data: ecritures,
        message: `${ecritures.length} écritures générées avec succès`,
      })
    } catch (error) {
      if (error.message.includes('non trouvé') || error.message.includes('clôturé')) {
        return res.status(400).json({ error: error.message })
      }
      logger.error(`[ComptaReglCtrl] Error generating ecritures: ${error.message}`)
      res.status(500).json({ error: 'Impossible de générer les écritures' })
    }
  }

  // ─── Annexes ───────────────────────────────────────────────

  static async getAnnexe1(req, res) {
    try {
      const { coproprieteId } = req.params
      const { annee } = req.query
      if (!annee) {
        return res.status(400).json({ error: 'Le paramètre annee est obligatoire' })
      }
      const data = await comptabiliteReglementaireService.getAnnexe1Data(coproprieteId, parseInt(annee))
      res.json({ data })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting annexe 1: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les données de l\'annexe 1' })
    }
  }

  static async getAnnexe2(req, res) {
    try {
      const { coproprieteId } = req.params
      const data = await comptabiliteReglementaireService.getAnnexe2Data(coproprieteId)
      res.json({ data })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting annexe 2: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les données de l\'annexe 2' })
    }
  }

  static async getAnnexe3(req, res) {
    try {
      const { coproprieteId } = req.params
      const { annee } = req.query
      if (!annee) {
        return res.status(400).json({ error: 'Le paramètre annee est obligatoire' })
      }
      const data = await comptabiliteReglementaireService.getAnnexe3Data(coproprieteId, parseInt(annee))
      res.json({ data })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting annexe 3: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les données de l\'annexe 3' })
    }
  }

  static async getAnnexe4(req, res) {
    try {
      const { coproprieteId } = req.params
      const { annee } = req.query
      if (!annee) {
        return res.status(400).json({ error: 'Le paramètre annee est obligatoire' })
      }
      const data = await comptabiliteReglementaireService.getAnnexe4Data(coproprieteId, parseInt(annee))
      res.json({ data })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting annexe 4: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les données de l\'annexe 4' })
    }
  }

  static async getAnnexe5(req, res) {
    try {
      const { coproprieteId } = req.params
      const { annee } = req.query
      if (!annee) {
        return res.status(400).json({ error: 'Le paramètre annee est obligatoire' })
      }
      const data = await comptabiliteReglementaireService.getAnnexe5Data(coproprieteId, parseInt(annee))
      res.json({ data })
    } catch (error) {
      logger.error(`[ComptaReglCtrl] Error getting annexe 5: ${error.message}`)
      res.status(500).json({ error: 'Impossible de récupérer les données de l\'annexe 5' })
    }
  }
}
