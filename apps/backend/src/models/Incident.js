import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class IncidentModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('incidents')
            .select(
                'incidents.*',
                'lots.numero as lot_numero',
                'coproprietaires.nom as signale_par_nom',
                'coproprietaires.prenom as signale_par_prenom'
            )
            .leftJoin('lots', 'incidents.lot_id', 'lots.id')
            .leftJoin('coproprietaires', 'incidents.signale_par_id', 'coproprietaires.id')
            .where('incidents.copropriete_id', coproprieteId)
            .orderBy('incidents.date_signalement', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('incidents')
            .select(
                'incidents.*',
                'lots.numero as lot_numero',
                'coproprietaires.nom as signale_par_nom',
                'coproprietaires.prenom as signale_par_prenom'
            )
            .leftJoin('lots', 'incidents.lot_id', 'lots.id')
            .leftJoin('coproprietaires', 'incidents.signale_par_id', 'coproprietaires.id')
            .where('incidents.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('incidents')
            .insert({
                copropriete_id: data.copropriete_id,
                lot_id: data.lot_id || null,
                signale_par_id: data.signale_par_id || null,
                titre: data.titre,
                description: data.description || null,
                categorie: data.categorie || null,
                urgence: data.urgence || 'moyenne',
                statut: data.statut || 'ouvert',
                date_signalement: data.date_signalement,
                date_resolution: data.date_resolution || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const allowedFields = [
            'titre', 'description', 'categorie', 'urgence',
            'statut', 'lot_id', 'signale_par_id',
            'date_signalement', 'date_resolution', 'notes',
        ]
        const sanitized = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        )
        const [result] = await db('incidents')
            .where('id', id)
            .update({ ...sanitized, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('incidents').where('id', id).del()
    }
}
