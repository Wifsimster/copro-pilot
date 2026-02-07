import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { Pool } from 'pg'
import logger from '../logger.js'
import knexDatabase from './knex-database.js'

let authInstance = null

/**
 * Get PostgreSQL database pool instance for Better Auth
 */
function getDatabase() {
    const knex = knexDatabase.getKnex()
    if (!knex) {
        throw new Error('Database not initialized. Make sure to call knexDatabase.init() first.')
    }

    const connection = knex.client.config.connection

    const pool = new Pool({
        host: connection.host,
        port: connection.port,
        database: connection.database,
        user: connection.user,
        password: connection.password
    })

    return pool
}

/**
 * Extrait l'URL de base (origin) d'une URL complète
 */
function getFrontendURL(url) {
    const isLocalDevelopment = process.env.NODE_ENV === 'development'
    const defaultFrontendUrl = isLocalDevelopment ? 'http://localhost:5173' : null

    if (!url) {
        if (defaultFrontendUrl) {
            return defaultFrontendUrl
        }
        throw new Error('BASE_URL doit être défini dans les variables d\'environnement')
    }

    try {
        const urlObj = new URL(url)
        return urlObj.origin
    } catch (error) {
        if (defaultFrontendUrl) {
            logger.warn(`BASE_URL invalide: "${url}", utilisation de la valeur par défaut`, { error: error.message })
            return defaultFrontendUrl
        }
        throw new Error(`BASE_URL invalide: "${url}"`, { cause: error })
    }
}

/**
 * Initialize Better Auth with async database connection
 */
export async function initializeAuth() {
    if (authInstance) {
        return authInstance
    }

    logger.info('Initializing Better Auth...')

    const db = getDatabase()
    const baseURL = getFrontendURL(process.env.BASE_URL)

    const secret = process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET

    if (!secret) {
        throw new Error('BETTER_AUTH_SECRET (or AUTH_SECRET) must be defined in environment variables')
    }

    const trustedOrigins = [baseURL]
    if (process.env.NODE_ENV === 'development') {
        try {
            const urlObj = new URL(baseURL)
            if (urlObj.hostname === 'localhost') {
                const altOrigin = `${urlObj.protocol}//127.0.0.1:${urlObj.port}`
                if (!trustedOrigins.includes(altOrigin)) {
                    trustedOrigins.push(altOrigin)
                }
            }
            if (urlObj.hostname === '127.0.0.1') {
                const altOrigin = `${urlObj.protocol}//localhost:${urlObj.port}`
                if (!trustedOrigins.includes(altOrigin)) {
                    trustedOrigins.push(altOrigin)
                }
            }

            const backendPort = process.env.PORT || '3001'
            const devPorts = [backendPort, '3000', '3001', '3002', '5173']
            devPorts.forEach(port => {
                const origins = [
                    `http://localhost:${port}`,
                    `http://127.0.0.1:${port}`
                ]
                origins.forEach(origin => {
                    if (!trustedOrigins.includes(origin)) {
                        trustedOrigins.push(origin)
                    }
                })
            })
        } catch (error) {
            logger.warn('Could not parse baseURL for trusted origins:', error.message)
        }
    }

    const socialProviders = {}
    if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET && process.env.MICROSOFT_TENANT_ID) {
        socialProviders.microsoft = {
            clientId: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            scope: ['user.read'],
            tenantId: process.env.MICROSOFT_TENANT_ID
        }
        logger.info('Microsoft OAuth provider configured')
    } else {
        logger.warn('Microsoft OAuth not configured (missing MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, or MICROSOFT_TENANT_ID)')
    }

    authInstance = betterAuth({
        secret: secret,
        database: db,
        baseURL: baseURL,
        trustedOrigins: trustedOrigins,
        emailAndPassword: {
            enabled: true
        },
        socialProviders,
        plugins: [
            admin({
                async isAdmin(user) {
                    const userRole = user?.role?.toLowerCase()
                    return userRole === 'admin'
                }
            })
        ]
    })

    logger.info('Better Auth initialized successfully')
    logger.info(`   Base URL: ${baseURL}`)
    logger.info(`   Trusted Origins: ${trustedOrigins.join(', ')}`)
    return authInstance
}

/**
 * Get the initialized auth instance
 */
export function getAuth() {
    if (!authInstance) {
        throw new Error('Auth not initialized. Call initializeAuth() first.')
    }
    return authInstance
}
