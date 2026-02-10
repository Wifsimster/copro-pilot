import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class SinistreModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('sinistres')
            .select(
                'sinistres.*',
                'assurances.compagnie as assurance_compagnie',
                'assurances.numero_police as assurance_numero_police',
                'incidents.titre as incident_titre'
            )
            .leftJoin('assurances', 'sinistres.assurance_id', 'assurances.id')
            .leftJoin('incidents', 'sinistres.incident_id', 'incidents.id')
            .where('sinistres.copropriete_id', coproprieteId)
            .orderBy('sinistres.date_sinistre', 'desc')
    }

    static async getAllByAssurance(assuranceId) {
        const db = getDb()
        return db('sinistres')
            .select(
                'sinistres.*',
                'incidents.titre as incident_titre'
            )
            .leftJoin('incidents', 'sinistres.incident_id', 'incidents.id')
            .where('sinistres.assurance_id', assuranceId)
            .orderBy('sinistres.date_sinistre', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('sinistres')
            .select(
                'sinistres.*',
                'assurances.compagnie as assurance_compagnie',
                'assurances.numero_police as assurance_numero_police',
                'incidents.titre as incident_titre'
            )
            .leftJoin('assurances', 'sinistres.assurance_id', 'assurances.id')
            .leftJoin('incidents', 'sinistres.incident_id', 'incidents.id')
            .where('sinistres.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('sinistres')
            .insert({
                assurance_id: data.assurance_id || null,
                incident_id: data.incident_id || null,
                copropriete_id: data.copropriete_id,
                numero_sinistre: data.numero_sinistre || null,
                date_sinistre: data.date_sinistre,
                date_declaration: data.date_declaration || null,
                description: data.description || null,
                montant_estime: data.montant_estime || null,
                montant_indemnise: data.montant_indemnise || null,
                statut: data.statut || 'declare',
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('sinistres')
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
        return db('sinistres').where('id', id).del()
    }
}
