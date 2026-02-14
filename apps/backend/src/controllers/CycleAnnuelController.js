import { cycleAnnuelService } from '../services/CycleAnnuelService.js'
import logger from '../logger.js'

export class CycleAnnuelController {
  static async getAllByCopropriete(req, res) {
    try {
      const { coproprieteId } = req.params
      const { annee } = req.query
      const taches = await cycleAnnuelService.getAllByCopropriete(
        coproprieteId,
        annee ? parseInt(annee) : undefined
      )
      res.json({ data: taches })
    } catch (error) {
      logger.error(
        `[CycleAnnuelController] Error: ${error.message}`
      )
      res.status(500).json({
        error:
          'Impossible de recuperer le cycle annuel',
      })
    }
  }

  static async initialize(req, res) {
    try {
      const { coproprieteId } = req.params
      const { annee } = req.body
      if (!annee) {
        return res
          .status(400)
          .json({ error: 'Le champ annee est obligatoire' })
      }
      const taches = await cycleAnnuelService.initializeCycle(
        parseInt(coproprieteId),
        annee
      )
      res
        .status(201)
        .json({ data: taches, message: 'Cycle annuel initialise' })
    } catch (error) {
      logger.error(
        `[CycleAnnuelController] Error initializing: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible d\'initialiser le cycle annuel',
      })
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params
      const result = await cycleAnnuelService.update(id, req.body)
      if (!result) {
        return res
          .status(404)
          .json({ error: 'Tache non trouvee' })
      }
      res.json({
        data: result,
        message: 'Tache mise a jour avec succes',
      })
    } catch (error) {
      logger.error(
        `[CycleAnnuelController] Error updating: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de mettre a jour la tache',
      })
    }
  }

  static async getSummary(req, res) {
    try {
      const { coproprieteId } = req.params
      const annee =
        req.query.annee || new Date().getFullYear()
      const summary = await cycleAnnuelService.getSummary(
        parseInt(coproprieteId),
        parseInt(annee)
      )
      res.json({ data: summary })
    } catch (error) {
      logger.error(
        `[CycleAnnuelController] Error getting summary: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de recuperer le resume',
      })
    }
  }

  static async refresh(req, res) {
    try {
      const { coproprieteId } = req.params
      const annee =
        req.query.annee || new Date().getFullYear()
      const taches = await cycleAnnuelService.refreshStatuses(
        parseInt(coproprieteId),
        parseInt(annee)
      )
      res.json({
        data: taches,
        message: 'Statuts actualises',
      })
    } catch (error) {
      logger.error(
        `[CycleAnnuelController] Error refreshing: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible d\'actualiser les statuts',
      })
    }
  }

  static async getDefinitions(req, res) {
    try {
      const definitions =
        cycleAnnuelService.getTachesDefinitions()
      res.json({ data: definitions })
    } catch (error) {
      logger.error(
        `[CycleAnnuelController] Error: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de recuperer les definitions',
      })
    }
  }
}
