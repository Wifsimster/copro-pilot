import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class PartieCommuneModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('parties_communes')
            .where('copropriete_id', coproprieteId)
            .orderBy('nom', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('parties_communes').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('parties_communes')
            .insert({
                copropriete_id: data.copropriete_id,
                nom: data.nom,
                categorie: data.categorie || 'generales',
                description: data.description || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('parties_communes')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('parties_communes').where('id', id).del()
    }
}
