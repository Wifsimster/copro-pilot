import { Router } from 'express'
import knexDatabase from '../config/knex-database.js'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const knex = knexDatabase.getKnex()
        let dbStatus = 'disconnected'

        if (knex) {
            await knex.raw('SELECT 1')
            dbStatus = 'connected'
        }

        res.json({
            status: 'ok',
            database: dbStatus,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        })
    }
})

export default router
