import { ExtranetModel } from '../models/Extranet.js'
import logger from '../logger.js'

class ExtranetService {
  async getProfilComplet(userId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const lots = await ExtranetModel.getMesLots(coproprietaire.id)
      const coproprietes = await ExtranetModel.getCoproprietesByCoproprietaire(coproprietaire.id)

      const conseilSyndical = []
      for (const copro of coproprietes) {
        const isMembre = await ExtranetModel.isConseilSyndical(coproprietaire.id, copro.id)
        if (isMembre) {
          const db = (await import('../config/knex-database.js')).default.getKnex()
          const membership = await db('conseil_syndical')
            .where({
              coproprietaire_id: coproprietaire.id,
              copropriete_id: copro.id,
            })
            .first()
          conseilSyndical.push({
            copropriete_id: copro.id,
            role: membership?.role || 'membre',
          })
        }
      }

      logger.info(`[ExtranetService] Profil complet récupéré pour userId=${userId}`)
      return { coproprietaire, lots, coproprietes, conseilSyndical }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting profil complet for userId=${userId}: ${error.message}`)
      throw error
    }
  }

  async getEspaceDocuments(userId, coproprieteId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const coproprietes = await ExtranetModel.getCoproprietesByCoproprietaire(coproprietaire.id)
      const hasAccess = coproprietes.some(c => c.id === parseInt(coproprieteId))
      if (!hasAccess) return null

      const [documents, pvsAG, diagnostics, assurances, contrats, contratSyndic] = await Promise.all([
        ExtranetModel.getDocumentsCopropriete(coproprieteId),
        ExtranetModel.getDerniersPVAG(coproprieteId),
        ExtranetModel.getDiagnostics(coproprieteId),
        ExtranetModel.getAssurances(coproprieteId),
        ExtranetModel.getContrats(coproprieteId),
        ExtranetModel.getContratSyndic(coproprieteId),
      ])

      logger.info(`[ExtranetService] Espace documents récupéré pour copropriété ${coproprieteId}`)
      return { documents, pvsAG, diagnostics, assurances, contrats, contratSyndic }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting espace documents for userId=${userId}, coproprieteId=${coproprieteId}: ${error.message}`)
      throw error
    }
  }

  async getMonCompte(userId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const solde = await ExtranetModel.getMonCompte(coproprietaire.id)
      logger.info(`[ExtranetService] Compte récupéré pour userId=${userId}`)
      return { coproprietaire, ...solde }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting mon compte for userId=${userId}: ${error.message}`)
      throw error
    }
  }

  async getMesCharges(userId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const charges = await ExtranetModel.getMesCharges(coproprietaire.id)
      logger.info(`[ExtranetService] Charges récupérées pour userId=${userId}`)
      return { coproprietaire, charges }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting mes charges for userId=${userId}: ${error.message}`)
      throw error
    }
  }

  async getMesAppelsFonds(userId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const appelsFonds = await ExtranetModel.getMesAppelsFonds(coproprietaire.id)
      logger.info(`[ExtranetService] Appels de fonds récupérés pour userId=${userId}`)
      return { coproprietaire, appelsFonds }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting mes appels de fonds for userId=${userId}: ${error.message}`)
      throw error
    }
  }

  async getMonFondsTravaux(userId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const fondsTravaux = await ExtranetModel.getMonFondsTravaux(coproprietaire.id)
      logger.info(`[ExtranetService] Fonds travaux récupéré pour userId=${userId}`)
      return { coproprietaire, fondsTravaux }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting mon fonds travaux for userId=${userId}: ${error.message}`)
      throw error
    }
  }

  async getDashboard(userId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const coproprietes = await ExtranetModel.getCoproprietesByCoproprietaire(coproprietaire.id)
      const coproprieteIds = coproprietes.map(c => c.id)

      const [compte, upcomingAGs, openIncidents, unreadNotifications] =
        await Promise.all([
          ExtranetModel.getMonCompte(coproprietaire.id),
          ExtranetModel.getUpcomingAGs(coproprieteIds),
          ExtranetModel.getOpenIncidents(coproprieteIds),
          ExtranetModel.getUnreadNotificationCount(userId),
        ])

      logger.info(`[ExtranetService] Dashboard récupéré pour userId=${userId}`)
      return {
        compte,
        unreadNotifications,
        upcomingAGs,
        openIncidents,
        coproprietes: coproprietes.length,
      }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting dashboard for userId=${userId}: ${error.message}`)
      throw error
    }
  }

  async getDonneesConseilSyndical(userId, coproprieteId) {
    try {
      const coproprietaire = await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const isMembre = await ExtranetModel.isConseilSyndical(coproprietaire.id, coproprieteId)
      if (!isMembre) return { forbidden: true }

      const [coproprietaires, soldes, comptesBancaires] = await Promise.all([
        ExtranetModel.getListeCoproprietaires(coproprieteId),
        ExtranetModel.getSoldesCharges(coproprieteId),
        ExtranetModel.getRelevesBancaires(coproprieteId),
      ])

      logger.info(`[ExtranetService] Données conseil syndical récupérées pour copropriété ${coproprieteId}`)
      return { coproprietaires, soldes, comptesBancaires }
    } catch (error) {
      logger.error(`[ExtranetService] Error getting données conseil syndical for userId=${userId}, coproprieteId=${coproprieteId}: ${error.message}`)
      throw error
    }
  }
  async updateProfil(userId, data) {
    try {
      const coproprietaire =
        await ExtranetModel.getCoproprietaireByUserId(userId)
      if (!coproprietaire) return null

      const updated = await ExtranetModel.updateCoproprietaire(
        coproprietaire.id,
        data
      )
      logger.info(
        '[ExtranetService] Profil mis a jour'
      )
      return updated
    } catch (error) {
      logger.error(
        `[ExtranetService] Error updating profil: ${error.message}`
      )
      throw error
    }
  }
}

export const extranetService = new ExtranetService()
