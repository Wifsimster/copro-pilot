import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class RelanceModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('relances')
            .select(
                'relances.*',
                'coproprietaires.nom as coproprietaire_nom',
                'coproprietaires.prenom as coproprietaire_prenom'
            )
            .leftJoin('coproprietaires', 'relances.coproprietaire_id', 'coproprietaires.id')
            .where('relances.copropriete_id', coproprieteId)
            .orderBy('relances.date_relance', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('relances')
            .select(
                'relances.*',
                'coproprietaires.nom as coproprietaire_nom',
                'coproprietaires.prenom as coproprietaire_prenom'
            )
            .leftJoin('coproprietaires', 'relances.coproprietaire_id', 'coproprietaires.id')
            .where('relances.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('relances')
            .insert({
                copropriete_id: data.copropriete_id,
                coproprietaire_id: data.coproprietaire_id,
                type: data.type || null,
                date_relance: data.date_relance,
                montant_du: data.montant_du,
                mode_envoi: data.mode_envoi || null,
                statut: data.statut || 'brouillon',
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        // copropriete_id and coproprietaire_id are immutable: changing them
        // via PUT would re-target a relance at a different debtor (and a
        // different copropriété), breaking recouvrement traceability.
        const allowedFields = [
            'type', 'date_relance', 'montant_du',
            'mode_envoi', 'statut', 'notes',
        ]
        const sanitized = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        )
        const [result] = await db('relances')
            .where('id', id)
            .update({
                ...sanitized,
                updated_at: db.fn.now(),
            })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('relances').where('id', id).del()
    }
}
