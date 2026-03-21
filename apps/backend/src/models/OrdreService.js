import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class OrdreServiceModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('ordres_service')
            .select(
                'ordres_service.*',
                'prestataires.nom as prestataire_nom',
                'incidents.titre as incident_titre'
            )
            .leftJoin(
                'prestataires',
                'ordres_service.prestataire_id',
                'prestataires.id'
            )
            .leftJoin(
                'incidents',
                'ordres_service.incident_id',
                'incidents.id'
            )
            .where('ordres_service.copropriete_id', coproprieteId)
            .orderBy('ordres_service.created_at', 'desc')
    }

    static async getAllByIncident(incidentId) {
        const db = getDb()
        return db('ordres_service')
            .select(
                'ordres_service.*',
                'prestataires.nom as prestataire_nom',
                'incidents.titre as incident_titre'
            )
            .leftJoin(
                'prestataires',
                'ordres_service.prestataire_id',
                'prestataires.id'
            )
            .leftJoin(
                'incidents',
                'ordres_service.incident_id',
                'incidents.id'
            )
            .where('ordres_service.incident_id', incidentId)
            .orderBy('ordres_service.created_at', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('ordres_service')
            .select(
                'ordres_service.*',
                'prestataires.nom as prestataire_nom',
                'incidents.titre as incident_titre'
            )
            .leftJoin(
                'prestataires',
                'ordres_service.prestataire_id',
                'prestataires.id'
            )
            .leftJoin(
                'incidents',
                'ordres_service.incident_id',
                'incidents.id'
            )
            .where('ordres_service.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('ordres_service')
            .insert({
                copropriete_id: data.copropriete_id,
                incident_id: data.incident_id || null,
                prestataire_id: data.prestataire_id || null,
                intervention_id: data.intervention_id || null,
                numero: data.numero,
                objet: data.objet,
                description: data.description || null,
                urgence: data.urgence || 'normale',
                statut: data.statut || 'brouillon',
                montant_estime: data.montant_estime || null,
                montant_devis: data.montant_devis || null,
                montant_facture: data.montant_facture || null,
                date_emission: data.date_emission || null,
                date_limite_reponse: data.date_limite_reponse || null,
                date_acceptation: data.date_acceptation || null,
                date_cloture: data.date_cloture || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const allowedFields = [
            'objet', 'description', 'urgence', 'statut',
            'prestataire_id', 'montant_estime', 'montant_devis',
            'montant_facture', 'date_emission', 'date_limite_reponse',
            'date_acceptation', 'date_cloture', 'notes',
        ]
        const sanitized = Object.fromEntries(
            Object.entries(data).filter(
                ([key]) => allowedFields.includes(key)
            )
        )
        const [result] = await db('ordres_service')
            .where('id', id)
            .update({ ...sanitized, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('ordres_service').where('id', id).del()
    }

    static async getNextNumero(year) {
        const db = getDb()
        const prefix = `ODS-${year}-`
        const last = await db('ordres_service')
            .where('numero', 'like', `${prefix}%`)
            .orderBy('numero', 'desc')
            .first()
        if (!last) return `${prefix}0001`
        const lastNum = parseInt(
            last.numero.replace(prefix, ''),
            10
        )
        return `${prefix}${String(lastNum + 1).padStart(4, '0')}`
    }
}
