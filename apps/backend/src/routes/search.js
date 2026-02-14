import { Router } from 'express'
import { SearchController } from '../controllers/SearchController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth(), SearchController.search)

export default router
