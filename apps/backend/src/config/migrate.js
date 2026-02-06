import knexDatabase from './knex-database.js'
import logger from '../logger.js'

/**
 * Applique les migrations Knex
 */
export async function migrate() {
    const knex = knexDatabase.getKnex()

    if (!knex) {
        const error = new Error('Base de données non initialisée')
        logger.error('Erreur lors de la migration:', error)
        return {
            success: false,
            error: error.message
        }
    }

    try {
        const [batch, log] = await knex.migrate.latest()

        return {
            success: true,
            batch,
            migrations: log
        }
    } catch (error) {
        logger.error('Erreur lors de la migration:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Rollback des migrations
 */
export async function rollback() {
    const knex = knexDatabase.getKnex()

    if (!knex) {
        const error = new Error('Base de données non initialisée')
        logger.error('Erreur lors du rollback:', error)
        return {
            success: false,
            error: error.message
        }
    }

    try {
        const [batch, log] = await knex.migrate.rollback()

        return {
            success: true,
            batch,
            migrations: log
        }
    } catch (error) {
        logger.error('Erreur lors du rollback:', error)
        return {
            success: false,
            error: error.message
        }
    }
}
