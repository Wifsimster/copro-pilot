import knex from 'knex'
import logger from '../logger.js'
import knexConfig from './knexfile.js'

const POOL_CHECK_INTERVAL_MS = 30_000
const POOL_UTILIZATION_WARN_THRESHOLD = 0.8

class KnexDatabaseService {
    constructor() {
        this.knex = null
        this._poolMonitorInterval = null
    }

    async init() {
        if (this.knex) {
            logger.info('Base de données déjà initialisée, réutilisation de la connexion existante')
            return
        }

        try {
            const environment = process.env.NODE_ENV || 'development'
            const knexEnvironment = environment === 'dev' ? 'development' : environment
            const config = knexConfig[knexEnvironment]

            if (!config) {
                throw new Error(`Configuration de base de données non trouvée pour l'environnement: ${environment} (mappé vers: ${knexEnvironment}). Environnements disponibles: ${Object.keys(knexConfig).join(', ')}`)
            }

            let postgresUri = ''
            if (typeof config.connection === 'string') {
                postgresUri = config.connection.replace(/:([^:@/]+)@/, ':****@')
            } else {
                const user = config.connection.user || ''
                const password = config.connection.password ? '****' : ''
                const host = config.connection.host || 'localhost'
                const port = config.connection.port || 5432
                const database = config.connection.database || ''
                postgresUri = `postgresql://${user}${password ? ':' + password : ''}@${host}:${port}/${database}`
            }
            logger.info(`PostgreSQL URI: ${postgresUri}`)

            this.knex = knex(config)

            await this.knex.raw('SELECT 1')

            const connectionInfo = typeof config.connection === 'string'
                ? config.connection.split('@')[1] || config.connection
                : `${config.connection.host}:${config.connection.port}/${config.connection.database}`

            logger.info(`Base de données PostgreSQL initialisée avec Knex: ${connectionInfo}`)

            this._startPoolMonitor(config.pool?.max || 10)
        } catch (error) {
            logger.error('Erreur lors de l\'initialisation de la base de données:', error)
            throw error
        }
    }

    _startPoolMonitor(maxPoolSize) {
        if (this._poolMonitorInterval) return

        this._poolMonitorInterval = setInterval(() => {
            if (!this.knex) return

            const pool = this.knex.client?.pool
            if (!pool) return

            const numUsed = pool.numUsed?.() ?? 0
            const numFree = pool.numFree?.() ?? 0
            const numPending = pool.numPendingAcquires?.() ?? 0
            const utilization = maxPoolSize > 0
                ? numUsed / maxPoolSize
                : 0

            if (utilization >= POOL_UTILIZATION_WARN_THRESHOLD) {
                logger.warn(
                    `[Pool] High utilization: ${numUsed}/${maxPoolSize} active (${(utilization * 100).toFixed(0)}%), ${numFree} idle, ${numPending} pending`
                )
            } else {
                logger.debug(
                    `[Pool] ${numUsed}/${maxPoolSize} active (${(utilization * 100).toFixed(0)}%), ${numFree} idle, ${numPending} pending`
                )
            }
        }, POOL_CHECK_INTERVAL_MS)

        // Allow the process to exit even if the interval is still active
        this._poolMonitorInterval.unref()
    }

    _stopPoolMonitor() {
        if (this._poolMonitorInterval) {
            clearInterval(this._poolMonitorInterval)
            this._poolMonitorInterval = null
        }
    }

    getKnex() {
        return this.knex
    }

    resetConnection() {
        this._stopPoolMonitor()
        if (this.knex) {
            this.knex.destroy()
            this.knex = null
        }
    }

    async close() {
        this._stopPoolMonitor()
        if (this.knex) {
            await this.knex.destroy()
            logger.info('Connexion à la base de données fermée')
        }
    }
}

export default new KnexDatabaseService()
