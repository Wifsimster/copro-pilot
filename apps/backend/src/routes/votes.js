import { Router } from 'express'
import { VoteElectroniqueController } from '../controllers/VoteElectroniqueController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/', requireAuth(), VoteElectroniqueController.castVote)
router.get('/my', requireAuth(), VoteElectroniqueController.getMyVotes)
router.get(
  '/resolution/:id/tally',
  requireAuth(),
  VoteElectroniqueController.getTally
)
router.get(
  '/resolution/:id',
  requireAuth(),
  VoteElectroniqueController.getByResolution
)

export default router
