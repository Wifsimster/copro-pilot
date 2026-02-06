import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class CoproprieteModel {
    static async getAll() {
        const db = getDb()
        return db('coproprietes')
            .select('*')
            .orderBy('nom', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('coproprietes').where('id', id).first()
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
                reglement_copropriete_url: data.reglement_copropriete_url || null,
                notes: data.notes || null,
            })
            .returning('*')
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
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('coproprietes').where('id', id).del()
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
