import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class LocataireModel {
    static async getAllByLot(lotId) {
        const db = getDb()
        return db('locataires')
            .where('lot_id', lotId)
            .orderBy('nom', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('locataires').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('locataires')
            .insert({
                lot_id: data.lot_id,
                nom: data.nom,
                prenom: data.prenom,
                email: data.email || null,
                telephone: data.telephone || null,
                date_entree: data.date_entree || null,
                date_sortie: data.date_sortie || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('locataires')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('locataires').where('id', id).del()
    }
}
