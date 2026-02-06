// Third-party packages
import cors from 'cors'
import express from 'express'
import cookieParser from 'cookie-parser'
import methodOverride from 'method-override'
import path from 'path'
import fs from 'fs'
import history from 'connect-history-api-fallback'
import { fileURLToPath } from 'url'

// Local modules
import knexDatabase from './config/knex-database.js'
import { migrate } from './config/migrate.js'
import logger from './logger.js'

// Import routes
import routes from './routes/index.js'

// Import middleware
import { requestLogger } from './middleware/requestLogger.js'
import { validateJSON } from './middleware/validation.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { toNodeHandler } from 'better-auth/node'

// Application configuration
const APP_NAME = 'immo-ia-backend'

const args = process.argv.slice(2)
const argPort = args.find(e => e.startsWith('--port'))
const port = argPort ? argPort.replace('--port=', '') : (process.env.PORT || '3001')

function getServerUrl() {
  const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL

  if (baseUrl) {
    try {
      const url = new URL(baseUrl)
      return url.origin
    } catch (error) {
      return baseUrl
    }
  }

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'local') {
    return `http://127.0.0.1:${port}`
  }

  return null
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database initialization with migrations
async function initializeDatabase() {
  try {
    logger.info('Initialisation du module de base de données...')
    await knexDatabase.init()
    logger.info('Module de base de données initialisé')

    logger.info('Exécution des migrations de base de données...')
    const migrationsSuccess = await migrate()
    if (!migrationsSuccess.success) {
      throw new Error(`Échec des migrations: ${migrationsSuccess.error}`)
    }

    if (migrationsSuccess.migrations && migrationsSuccess.migrations.length > 0) {
      logger.info(`Migrations appliquées avec succès (Batch ${migrationsSuccess.batch})`)
      migrationsSuccess.migrations.forEach(migration => {
        logger.info(`   - ${migration}`)
      })
    } else {
      logger.info('Base de données déjà à jour')
    }

  } catch (error) {
    logger.error('Database migration failed:', error.message)
    logger.error('Migration error details:', error)
    process.exit(1)
  }
}

// Validate required environment variables
function validateEnvironment() {
  const missing = []

  if (!process.env.BETTER_AUTH_SECRET && !process.env.AUTH_SECRET) {
    missing.push('BETTER_AUTH_SECRET')
  }

  if (missing.length > 0) {
    logger.error('Missing required environment variables:')
    missing.forEach(varName => {
      logger.error(`   - ${varName}`)
    })
    logger.error('These secrets should be defined in your .env file.')
    process.exit(1)
  }

  const oauthEnvVars = ['MICROSOFT_TENANT_ID', 'MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET']
  const missingOAuth = oauthEnvVars.filter(varName => !process.env[varName])
  if (missingOAuth.length > 0) {
    logger.warn('Microsoft OAuth env vars missing (OAuth login will be disabled):')
    missingOAuth.forEach(varName => {
      logger.warn(`   - ${varName}`)
    })
  }
}

// Initialize Better Auth
let auth = null

async function initializeBetterAuth() {
  try {
    const { initializeAuth } = await import('./config/auth.js')
    auth = await initializeAuth()
    logger.info('[Auth] Better Auth initialized successfully')
    return auth
  } catch (error) {
    logger.error('[Auth] Failed to initialize Better Auth:', error.message)
    logger.error('[Auth] OAuth authentication will not be available')
    return null
  }
}

async function main() {
  try {
    logger.info(`[${APP_NAME}] startup - NODE_ENV=${process.env.NODE_ENV}`)

    // Validate environment variables
    validateEnvironment()

    // Initialize database with migrations
    await initializeDatabase()

    // Initialize Better Auth
    await initializeBetterAuth()

    // Initialize Express app
    const app = express()

    // CORS configuration
    const frontendUrl = process.env.BASE_URL || process.env.FRONTEND_URL

    if (process.env.NODE_ENV === 'production' && !frontendUrl) {
      logger.error('FRONTEND_URL or BASE_URL must be set in production environment')
      process.exit(1)
    }

    app.use(cors({
      origin: process.env.NODE_ENV === 'development'
        ? ['http://localhost:5173', 'http://127.0.0.1:5173']
        : frontendUrl,
      credentials: true
    }))

    // Better Auth handler before express.json()
    if (auth) {
      app.use('/api/auth', toNodeHandler(auth))
      logger.info('[Auth] Better Auth handler mounted at /api/auth')
    }

    // Body parsing middleware
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    app.use(methodOverride())

    app.set('query parser', 'extended')

    app.use(cookieParser())

    // Custom middleware
    app.use(requestLogger)
    app.use(validateJSON)

    // Inject database connection
    app.use((req, res, next) => {
      req.db = knexDatabase.getKnex()
      next()
    })

    // Mount Express routes under /api prefix
    app.use('/api', routes)

    // Handler 404 pour les routes API
    app.use('/api', (req, res) => {
      res.status(404).json({
        error: 'Route API non trouvée',
        path: req.originalUrl,
        method: req.method
      })
    })

    // Serve static frontend build files (production)
    const frontendDistPath = path.join(__dirname, '../../../frontend-dist')
    const frontendDistExists = fs.existsSync(frontendDistPath) && fs.statSync(frontendDistPath).isDirectory()

    if (process.env.NODE_ENV === 'production' || frontendDistExists) {
      logger.info(`Serving SPA from: ${frontendDistPath}`)

      app.use(history({
        rewrites: [
          {
            from: /^\/api\/.*$/, to: function (context) {
              return context.parsedUrl.path
            }
          }
        ]
      }))

      app.use(express.static(frontendDistPath, {
        maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
        etag: true,
        lastModified: true
      }))

      app.use((req, res) => {
        if (req.method === 'GET') {
          res.sendFile(path.join(frontendDistPath, 'index.html'))
        } else {
          res.status(405).json({
            error: 'Méthode non autorisée',
            path: req.originalUrl,
            method: req.method
          })
        }
      })
    } else {
      logger.info('Development mode: SPA should be served by Vite dev server')

      app.use((req, res) => {
        res.status(404).json({
          error: 'Route non trouvée',
          path: req.originalUrl,
          method: req.method
        })
      })
    }

    // Error handling middleware (must be last)
    app.use(notFoundHandler)
    app.use(errorHandler)

    // Create HTTP server
    const serverUrl = getServerUrl()
    const server = app.listen(port, () => {
      if (serverUrl) {
        logger.info(`[${APP_NAME}] Web server available at ${serverUrl}`)
      } else {
        logger.info(`[${APP_NAME}] Web server starting on port ${port}`)
      }
    })

    logger.info(`ImmoIA Backend started successfully!`)
    logger.info(`Server running on port ${port}`)
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`[${APP_NAME}] Received ${signal}. Starting graceful shutdown...`)

      server.close(async (err) => {
        if (err) {
          logger.error(`[${APP_NAME}] Error during server shutdown:`, err)
          process.exit(1)
        }

        logger.info(`[${APP_NAME}] HTTP server closed`)

        try {
          await knexDatabase.close()
          logger.info(`[${APP_NAME}] Database connections closed`)
        } catch (dbError) {
          logger.error(`[${APP_NAME}] Error closing database:`, dbError)
        }

        logger.info(`[${APP_NAME}] Graceful shutdown completed`)
        process.exit(0)
      })

      setTimeout(() => {
        logger.error(`[${APP_NAME}] Could not close connections in time, forcefully shutting down`)
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'))

    process.on('uncaughtException', (err) => {
      logger.error(`[${APP_NAME}] Uncaught Exception:`, err)
      gracefulShutdown('uncaughtException')
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`[${APP_NAME}] Unhandled Rejection at:`, promise, 'reason:', reason)
      gracefulShutdown('unhandledRejection')
    })

  } catch (err) {
    logger.error(`[${APP_NAME}] Startup error: ${err.message}`)
    process.exit(1)
  }
}

main()
