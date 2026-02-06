import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class CarnetEntretienModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('carnet_entretien')
            .where('copropriete_id', coproprieteId)
            .orderBy('date_realisation', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('carnet_entretien').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('carnet_entretien')
            .insert({
                copropriete_id: data.copropriete_id,
                titre: data.titre,
                description: data.description || null,
                prestataire: data.prestataire || null,
                montant: data.montant || null,
                date_realisation: data.date_realisation,
                categorie: data.categorie || null,
                intervention_id: data.intervention_id || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('carnet_entretien')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('carnet_entretien').where('id', id).del()
    }
}
