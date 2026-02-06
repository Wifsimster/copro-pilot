import { Router } from 'express'
import healthRoutes from './health.js'

const router = Router()

// API routes
router.use('/health', healthRoutes)

// Future routes will be added here as modules are implemented:
// router.use('/coproprietes', coproprietesRoutes)
// router.use('/coproprietaires', coproprietairesRoutes)
// router.use('/lots', lotsRoutes)
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
