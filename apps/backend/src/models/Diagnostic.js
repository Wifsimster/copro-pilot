import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class DiagnosticModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('diagnostics')
            .where('copropriete_id', coproprieteId)
            .orderBy('date_validite', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('diagnostics')
            .where('id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('diagnostics')
            .insert({
                copropriete_id: data.copropriete_id,
                type: data.type,
                prestataire: data.prestataire || null,
                date_realisation: data.date_realisation,
                date_validite: data.date_validite || null,
                document_url: data.document_url || null,
                observations: data.observations || null,
                statut: data.statut || 'valide',
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('diagnostics')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('diagnostics').where('id', id).del()
    }
}
