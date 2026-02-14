import { Router } from 'express'
import { CycleAnnuelController } from '../controllers/CycleAnnuelController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth())

// Definitions des taches
router.get(
  '/definitions',
  CycleAnnuelController.getDefinitions
)

// Cycle par copropriete
router.get(
  '/copropriete/:coproprieteId',
  CycleAnnuelController.getAllByCopropriete
)

// Resume du cycle
router.get(
  '/copropriete/:coproprieteId/summary',
  CycleAnnuelController.getSummary
)

// Initialiser le cycle pour une annee
router.post(
  '/copropriete/:coproprieteId/initialize',
  CycleAnnuelController.initialize
)

// Rafraichir les statuts automatiquement
router.post(
  '/copropriete/:coproprieteId/refresh',
  CycleAnnuelController.refresh
)

// Mettre a jour une tache
router.put('/:id', CycleAnnuelController.update)

export default router
