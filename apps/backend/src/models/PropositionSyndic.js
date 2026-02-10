import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class PropositionSyndicModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('propositions_syndic')
            .select('*')
            .where('copropriete_id', coproprieteId)
            .orderBy('date_reception', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('propositions_syndic')
            .select('*')
            .where('id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('propositions_syndic')
            .insert({
                copropriete_id: data.copropriete_id,
                syndic_nom: data.syndic_nom,
                date_reception: data.date_reception,
                montant_propose: data.montant_propose || null,
                prestations_proposees: data.prestations_proposees || null,
                document_url: data.document_url || null,
                retenue: data.retenue || false,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('propositions_syndic')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('propositions_syndic').where('id', id).del()
    }
}
