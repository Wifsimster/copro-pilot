import { Router } from 'express'
import { LocataireController } from '../controllers/LocataireController.js'
import { requireAuth } from '../middleware/auth.js'
import {
  requireAdminForDelete,
  requireStaff,
} from '../middleware/authorization.js'

const router = Router()

// Tenant (locataire) records carry PII and are not scoped per copropriété
// on these generic routes, so they must stay staff-only — copropriétaires
// have no legitimate access to other owners' tenants.
router.use(requireAuth(), requireStaff)

router.get('/lot/:lotId', requireAuth(), LocataireController.getAllByLot)
router.get('/:id', requireAuth(), LocataireController.getById)
router.post('/', requireAuth(), LocataireController.create)
router.put('/:id', requireAuth(), LocataireController.update)
router.delete('/:id', requireAuth(), requireAdminForDelete, LocataireController.delete)

export default router
