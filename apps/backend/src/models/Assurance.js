import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class AssuranceModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('assurances')
            .where('copropriete_id', coproprieteId)
            .orderBy('date_debut', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('assurances').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('assurances')
            .insert({
                copropriete_id: data.copropriete_id,
                compagnie: data.compagnie,
                numero_police: data.numero_police || null,
                type: data.type || 'multirisque_immeuble',
                date_debut: data.date_debut,
                date_fin: data.date_fin || null,
                prime_annuelle: data.prime_annuelle || null,
                franchise: data.franchise || null,
                statut: data.statut || 'actif',
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('assurances')
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
        return db('assurances').where('id', id).del()
    }
}
