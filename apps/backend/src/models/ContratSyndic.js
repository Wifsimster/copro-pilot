import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ContratSyndicModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('contrats_syndic')
            .where('copropriete_id', coproprieteId)
            .orderBy('date_debut', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('contrats_syndic').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('contrats_syndic')
            .insert({
                copropriete_id: data.copropriete_id,
                syndic_nom: data.syndic_nom,
                date_debut: data.date_debut,
                date_fin: data.date_fin,
                remuneration_forfait: data.remuneration_forfait || null,
                prestations_incluses: data.prestations_incluses || null,
                prestations_particulieres: data.prestations_particulieres || null,
                conditions_execution: data.conditions_execution || null,
                statut: data.statut || 'en_cours',
                ag_designation_id: data.ag_designation_id || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('contrats_syndic')
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
        return db('contrats_syndic').where('id', id).del()
    }
}
