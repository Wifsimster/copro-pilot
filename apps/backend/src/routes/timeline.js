import { Router } from 'express'
import { DomainEventModel } from '../models/DomainEvent.js'
import { requireAuth } from '../middleware/auth.js'
import logger from '../logger.js'

const router = Router()

router.get(
  '/:entityType/:entityId',
  requireAuth(),
  async (req, res) => {
    try {
      const { entityType, entityId } = req.params
      const events = await DomainEventModel.getByEntity(
        entityType,
        parseInt(entityId, 10)
      )
      res.json({ data: events })
    } catch (error) {
      logger.error(
        `[Timeline] Error: ${error.message}`
      )
      res.status(500).json({
        error: 'Impossible de recuperer la timeline',
      })
    }
  }
)

export default router
