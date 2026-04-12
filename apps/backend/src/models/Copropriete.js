import knexDatabase from '../config/knex-database.js'
import cache from '../utils/cache.js'

const getDb = () => knexDatabase.getKnex()

const CACHE_KEY_ALL = 'coproprietes:all'
const CACHE_KEY_PREFIX = 'coproprietes:id:'
const CACHE_TTL = 300 // 5 minutes

export class CoproprieteModel {
    static invalidateCache(id) {
        cache.del(CACHE_KEY_ALL)
        if (id) {
            cache.del(`${CACHE_KEY_PREFIX}${id}`)
        }
    }

    static async getAll() {
        const cached = cache.get(CACHE_KEY_ALL)
        if (cached) return cached

        const db = getDb()
        const result = await db('coproprietes')
            .select('*')
            .orderBy('nom', 'asc')

        cache.set(CACHE_KEY_ALL, result, CACHE_TTL)
        return result
    }

    static async getAllPaginated({ limit, offset, sortBy, sortOrder }) {
        const db = getDb()
        const [{ count }] = await db('coproprietes').count('id as count')
        const data = await db('coproprietes')
            .select('*')
            .orderBy(sortBy, sortOrder)
            .limit(limit)
            .offset(offset)
        return { data, total: parseInt(count) }
    }

    static async getById(id) {
        const cacheKey = `${CACHE_KEY_PREFIX}${id}`
        const cached = cache.get(cacheKey)
        if (cached) return cached

        const db = getDb()
        const result = await db('coproprietes').where('id', id).first()

        if (result) {
            cache.set(cacheKey, result, CACHE_TTL)
        }
        return result
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('coproprietes')
            .insert({
                nom: data.nom,
                adresse: data.adresse,
                code_postal: data.code_postal,
                ville: data.ville,
                date_creation: data.date_creation || null,
                nombre_lots: data.nombre_lots || 0,
                numero_immatriculation: data.numero_immatriculation || null,
                date_immatriculation: data.date_immatriculation || null,
                date_derniere_maj_registre: data.date_derniere_maj_registre || null,
                reglement_copropriete_url: data.reglement_copropriete_url || null,
                notes: data.notes || null,
                nombre_batiments: data.nombre_batiments || 0,
                nombre_ascenseurs: data.nombre_ascenseurs || 0,
                periode_construction: data.periode_construction || null,
                type_chauffage: data.type_chauffage || null,
                energie_chauffage: data.energie_chauffage || null,
            })
            .returning('*')
        CoproprieteModel.invalidateCache()
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('coproprietes')
            .where('id', id)
            .update({
                ...data,
                updated_at: db.fn.now(),
            })
            .returning('*')
        CoproprieteModel.invalidateCache(id)
        return result
    }

    static async delete(id) {
        const db = getDb()
        const result = await db('coproprietes').where('id', id).del()
        CoproprieteModel.invalidateCache(id)
        return result
    }

    static async getStats(id) {
        const db = getDb()
        const lots = await db('lots').where('copropriete_id', id).count('id as count').first()
        const tantiemes = await db('lots').where('copropriete_id', id).sum('tantiemes as total').first()
        const coproprietaires = await db('lots')
            .where('copropriete_id', id)
            .whereNotNull('coproprietaire_id')
            .countDistinct('coproprietaire_id as count')
            .first()

        return {
            nombre_lots: parseInt(lots?.count || 0),
            total_tantiemes: parseInt(tantiemes?.total || 0),
            nombre_coproprietaires: parseInt(coproprietaires?.count || 0),
        }
    }
}
