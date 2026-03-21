import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class InterventionModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('interventions')
            .select('interventions.*', 'incidents.titre as incident_titre')
            .leftJoin('incidents', 'interventions.incident_id', 'incidents.id')
            .where('interventions.copropriete_id', coproprieteId)
            .orderBy('interventions.created_at', 'desc')
    }

    static async getAllByIncident(incidentId) {
        const db = getDb()
        return db('interventions')
            .where('incident_id', incidentId)
            .orderBy('created_at', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('interventions')
            .select('interventions.*', 'incidents.titre as incident_titre')
            .leftJoin('incidents', 'interventions.incident_id', 'incidents.id')
            .where('interventions.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('interventions')
            .insert({
                incident_id: data.incident_id || null,
                copropriete_id: data.copropriete_id,
                prestataire: data.prestataire || null,
                description: data.description || null,
                montant_devis: data.montant_devis || null,
                montant_facture: data.montant_facture || null,
                date_prevue: data.date_prevue || null,
                date_realisation: data.date_realisation || null,
                statut: data.statut || 'en_attente',
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const allowedFields = [
            'incident_id', 'prestataire', 'description',
            'montant_devis', 'montant_facture', 'date_prevue',
            'date_realisation', 'statut', 'notes',
        ]
        const sanitized = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        )
        const [result] = await db('interventions')
            .where('id', id)
            .update({ ...sanitized, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('interventions').where('id', id).del()
    }
}
