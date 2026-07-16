import { Router } from 'express'
import { RegularisationController } from '../controllers/RegularisationController.js'
import { requireAuth } from '../middleware/auth.js'
import { requirePlan } from '../middleware/requirePlan.js'
import { validate } from '../middleware/validate.js'
import { regularisationSchema } from '../schemas/index.js'

const router = Router()

// Régularisation des charges (clôture) — accounting feature, Essentiel+.
router.get(
  '/copropriete/:coproprieteId',
  requireAuth(),
  requirePlan('essentiel'),
  RegularisationController.getAllByCopropriete
)
router.get(
  '/:id',
  requireAuth(),
  requirePlan('essentiel'),
  RegularisationController.getById
)
router.post(
  '/',
  requireAuth(),
  requirePlan('essentiel'),
  validate(regularisationSchema),
  RegularisationController.create
)
router.post(
  '/:id/generer-appel',
  requireAuth(),
  requirePlan('essentiel'),
  RegularisationController.genererAppel
)

export default router
