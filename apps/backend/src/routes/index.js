import { Router } from 'express'
import healthRoutes from './health.js'
import coproprietesRoutes from './coproprietes.js'
import coproprietairesRoutes from './coproprietaires.js'
import lotsRoutes from './lots.js'

const router = Router()

// API routes
router.use('/health', healthRoutes)
router.use('/coproprietes', coproprietesRoutes)
router.use('/coproprietaires', coproprietairesRoutes)
router.use('/lots', lotsRoutes)

// Future routes:
// router.use('/charges', chargesRoutes)
// router.use('/assemblees', assembleesRoutes)
// router.use('/travaux', travauxRoutes)
// router.use('/documents', documentsRoutes)

// Root health check
router.get('/', (req, res) => {
    res.json({
        service: 'ImmoIA Backend',
        version: '0.1.0',
        status: 'running',
        timestamp: new Date().toISOString()
    })
})

export default router
