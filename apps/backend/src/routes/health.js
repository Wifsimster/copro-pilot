import { Router } from 'express'
import knexDatabase from '../config/knex-database.js'

const router = Router()

const APP_VERSION =
  process.env.APP_VERSION || process.env.npm_package_version || '0.1.0'

router.get('/', async (req, res) => {
    const knex = knexDatabase.getKnex()
    let connected = false
    let latencyMs = null
    let dbError = null

    if (knex) {
        const start = process.hrtime.bigint()
        try {
            await knex.raw('SELECT 1')
            const end = process.hrtime.bigint()
            latencyMs = Number(end - start) / 1e6
            connected = true
        } catch (error) {
            dbError = error.message
        }
    } else {
        dbError = 'database not initialized'
    }

    const payload = {
        status: connected ? 'ok' : 'error',
        uptime: process.uptime(),
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        database: {
            connected,
            latency_ms: latencyMs,
        },
    }

    if (dbError) {
        payload.database.error = dbError
    }

    res.status(connected ? 200 : 503).json(payload)
})

export default router
