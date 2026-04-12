import path from 'path'
import { fileURLToPath } from 'url'
import logger from '../logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const getPostgresConnection = () => {
    if (process.env.POSTGRES_URI) {
        return process.env.POSTGRES_URI
    }

    if (process.env.NODE_ENV === 'production' && !process.env.POSTGRES_PASSWORD) {
        throw new Error('POSTGRES_PASSWORD is required in production')
    }

    return {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        database: process.env.POSTGRES_DB || 'copro_pilot',
        user: process.env.POSTGRES_USER || 'copro_pilot',
        password: process.env.POSTGRES_PASSWORD || ''
    }
}

const config = {
    development: {
        client: 'pg',
        connection: getPostgresConnection(),
        debug: true,
        migrations: {
            directory: path.join(__dirname, '../../migrations'),
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: path.join(__dirname, '../../seeds')
        },
        pool: {
            min: 2,
            max: 20,
            acquireTimeoutMillis: 60000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000
        }
    },

    test: {
        client: 'pg',
        connection: getPostgresConnection(),
        migrations: {
            directory: path.join(__dirname, '../../migrations'),
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: path.join(__dirname, '../../seeds')
        },
        pool: {
            min: 1,
            max: 5
        }
    },

    production: {
        client: 'pg',
        connection: getPostgresConnection(),
        migrations: {
            directory: path.join(__dirname, '../../migrations'),
            tableName: 'knex_migrations'
        },
        seeds: {
            directory: path.join(__dirname, '../../seeds')
        },
        pool: {
            min: 2,
            max: 20,
            acquireTimeoutMillis: 60000,
            idleTimeoutMillis: 30000,
            reapIntervalMillis: 1000
        }
    }
}

export default config
