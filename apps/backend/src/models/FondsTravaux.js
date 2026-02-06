import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class FondsTravauxModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('fonds_travaux')
            .where('copropriete_id', coproprieteId)
            .orderBy('annee', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('fonds_travaux').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('fonds_travaux')
            .insert({
                copropriete_id: data.copropriete_id,
                annee: data.annee,
                cotisation_annuelle: data.cotisation_annuelle || 0,
                solde: data.solde || 0,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('fonds_travaux')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('fonds_travaux').where('id', id).del()
    }
}
