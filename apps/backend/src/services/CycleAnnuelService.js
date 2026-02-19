import { CycleAnnuelModel } from '../models/CycleAnnuel.js'
import knexDatabase from '../config/knex-database.js'
import logger from '../logger.js'

const TACHES_ANNUELLES = [
  {
    code: 'budget_vote',
    label: 'Budget previsionnel vote en AG',
  },
  {
    code: 'appel_t1',
    label: 'Appel de fonds T1 emis',
  },
  {
    code: 'appel_t2',
    label: 'Appel de fonds T2 emis',
  },
  {
    code: 'appel_t3',
    label: 'Appel de fonds T3 emis',
  },
  {
    code: 'appel_t4',
    label: 'Appel de fonds T4 emis',
  },
  {
    code: 'ag_ordinaire',
    label: 'AG ordinaire tenue',
  },
  {
    code: 'comptes_approuves',
    label: 'Comptes approuves en AG',
  },
  {
    code: 'exercice_cloture',
    label: 'Exercice comptable cloture',
  },
  {
    code: 'declaration_registre',
    label: 'Declaration registre national effectuee',
  },
  {
    code: 'contrat_syndic',
    label: 'Contrat de syndic en cours de validite',
  },
  {
    code: 'assurance_mri',
    label: 'Assurance multirisque immeuble a jour',
  },
  {
    code: 'diagnostics_obligatoires',
    label: 'Diagnostics obligatoires a jour',
  },
  {
    code: 'fonds_travaux',
    label: 'Cotisations fonds travaux appelees (loi ALUR)',
  },
]

class CycleAnnuelService {
  getTachesDefinitions() {
    return TACHES_ANNUELLES
  }

  async getAllByCopropriete(coproprieteId, annee) {
    try {
      return await CycleAnnuelModel.getAllByCopropriete(
        coproprieteId,
        annee
      )
    } catch (error) {
      logger.error(
        `[CycleAnnuelService] Error getting cycle: ${error.message}`
      )
      throw error
    }
  }

  async getById(id) {
    try {
      return await CycleAnnuelModel.getById(id)
    } catch (error) {
      logger.error(
        `[CycleAnnuelService] Error getting tache ${id}: ${error.message}`
      )
      throw error
    }
  }

  async update(id, data) {
    try {
      const existing = await CycleAnnuelModel.getById(id)
      if (!existing) return null
      const result = await CycleAnnuelModel.update(id, data)
      logger.info(
        `[CycleAnnuelService] Tache mise a jour (ID: ${id})`
      )
      return result
    } catch (error) {
      logger.error(
        `[CycleAnnuelService] Error updating tache ${id}: ${error.message}`
      )
      throw error
    }
  }

  async initializeCycle(coproprieteId, annee) {
    try {
      const existing = await CycleAnnuelModel.getAllByCopropriete(
        coproprieteId,
        annee
      )
      if (existing.length > 0) {
        return existing
      }

      const tasks = []
      for (const tache of TACHES_ANNUELLES) {
        tasks.push(
          CycleAnnuelModel.create({
            copropriete_id: coproprieteId,
            annee,
            tache_code: tache.code,
            tache_label: tache.label,
            statut: 'pending',
          })
        )
      }
      const results = await Promise.all(tasks)
      logger.info(
        `[CycleAnnuelService] Cycle ${annee} initialized for copropriete ${coproprieteId} (${results.length} tasks)`
      )
      return results
    } catch (error) {
      logger.error(
        `[CycleAnnuelService] Error initializing cycle: ${error.message}`
      )
      throw error
    }
  }

  async getSummary(coproprieteId, annee) {
    try {
      return await CycleAnnuelModel.getSummaryByCopropriete(
        coproprieteId,
        annee
      )
    } catch (error) {
      logger.error(
        `[CycleAnnuelService] Error getting summary: ${error.message}`
      )
      throw error
    }
  }

  async refreshStatuses(coproprieteId, annee) {
    try {
      const db = knexDatabase.getKnex()

      // Check budget vote
      const budget = await db('budgets_previsionnels')
        .where({ copropriete_id: coproprieteId, annee })
        .whereIn('statut', ['vote', 'approuve'])
        .first()
      if (budget) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'budget_vote',
          {
            tache_label: 'Budget previsionnel vote en AG',
            statut: 'completed',
            date_completion: budget.date_vote,
          }
        )
      }

      // Check appels de fonds per trimester
      for (let t = 1; t <= 4; t++) {
        const appel = await db('appels_fonds')
          .where({
            copropriete_id: coproprieteId,
            annee,
            trimestre: t,
          })
          .whereIn('statut', ['emis', 'cloture'])
          .first()
        if (appel) {
          await CycleAnnuelModel.upsert(
            coproprieteId,
            annee,
            `appel_t${t}`,
            {
              tache_label: `Appel de fonds T${t} emis`,
              statut: 'completed',
              date_completion: appel.date_emission,
            }
          )
        }
      }

      // Check AG ordinaire
      const ag = await db('assemblees_generales')
        .where({
          copropriete_id: coproprieteId,
          type: 'ordinaire',
          statut: 'terminee',
        })
        .whereRaw("EXTRACT(YEAR FROM date) = ?", [annee])
        .first()
      if (ag) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'ag_ordinaire',
          {
            tache_label: 'AG ordinaire tenue',
            statut: 'completed',
            date_completion: ag.date,
          }
        )
      }

      // Check exercice comptable cloture
      const exercice = await db('exercices_comptables')
        .where({
          copropriete_id: coproprieteId,
          annee,
          statut: 'cloture',
        })
        .first()
      if (exercice) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'exercice_cloture',
          {
            tache_label: 'Exercice comptable cloture',
            statut: 'completed',
            date_completion: exercice.date_cloture,
          }
        )
      }

      // Check declaration registre
      const declaration = await db('declarations_registre')
        .where({
          copropriete_id: coproprieteId,
          annee,
        })
        .whereIn('statut', ['soumis', 'valide'])
        .first()
      if (declaration) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'declaration_registre',
          {
            tache_label:
              'Declaration registre national effectuee',
            statut: 'completed',
            date_completion: declaration.date_declaration,
          }
        )
      }

      // Check contrat syndic
      const contratSyndic = await db('contrats_syndic')
        .where({ copropriete_id: coproprieteId, statut: 'en_cours' })
        .first()
      if (contratSyndic) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'contrat_syndic',
          {
            tache_label: 'Contrat de syndic en cours de validite',
            statut: 'completed',
          }
        )
      }

      // Check assurance MRI
      const assurance = await db('assurances')
        .where({
          copropriete_id: coproprieteId,
          type: 'multirisque_immeuble',
          statut: 'actif',
        })
        .first()
      if (assurance) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'assurance_mri',
          {
            tache_label:
              'Assurance multirisque immeuble a jour',
            statut: 'completed',
          }
        )
      }

      // Check diagnostics obligatoires (DPE + amiante)
      const diags = await db('diagnostics')
        .where({ copropriete_id: coproprieteId, statut: 'valide' })
        .whereIn('type', ['dpe', 'amiante'])
      if (diags.length >= 2) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'diagnostics_obligatoires',
          {
            tache_label: 'Diagnostics obligatoires a jour',
            statut: 'completed',
          }
        )
      }

      // Check fonds travaux
      const fonds = await db('fonds_travaux')
        .where({ copropriete_id: coproprieteId, annee })
        .first()
      if (fonds && parseFloat(fonds.cotisation_annuelle) > 0) {
        await CycleAnnuelModel.upsert(
          coproprieteId,
          annee,
          'fonds_travaux',
          {
            tache_label:
              'Cotisations fonds travaux appelees (loi ALUR)',
            statut: 'completed',
          }
        )
      }

      return await CycleAnnuelModel.getAllByCopropriete(
        coproprieteId,
        annee
      )
    } catch (error) {
      logger.error(
        `[CycleAnnuelService] Error refreshing: ${error.message}`
      )
      throw error
    }
  }
}

export const cycleAnnuelService = new CycleAnnuelService()
