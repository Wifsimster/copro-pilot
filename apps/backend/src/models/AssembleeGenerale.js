import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class AssembleeGeneraleModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('assemblees_generales')
            .where('copropriete_id', coproprieteId)
            .orderBy('date', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('assemblees_generales').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('assemblees_generales')
            .insert({
                copropriete_id: data.copropriete_id,
                date: data.date,
                heure: data.heure || null,
                lieu: data.lieu || null,
                type: data.type || 'ordinaire',
                statut: data.statut || 'planifiee',
                date_convocation: data.date_convocation || null,
                ordre_du_jour: data.ordre_du_jour || null,
                pv_url: data.pv_url || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('assemblees_generales')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('assemblees_generales').where('id', id).del()
    }

    // Résolutions
    static async getResolutions(agId) {
        const db = getDb()
        return db('resolutions')
            .where('ag_id', agId)
            .orderBy('numero', 'asc')
    }

    static async createResolution(data) {
        const db = getDb()
        const [result] = await db('resolutions')
            .insert({
                ag_id: data.ag_id,
                numero: data.numero,
                titre: data.titre,
                description: data.description || null,
                majorite: data.majorite || 'article_24',
                resultat: data.resultat || null,
                voix_pour: data.voix_pour || 0,
                voix_contre: data.voix_contre || 0,
                abstentions: data.abstentions || 0,
            })
            .returning('*')
        return result
    }

    static async updateResolution(id, data) {
        const db = getDb()
        const [result] = await db('resolutions')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async deleteResolution(id) {
        const db = getDb()
        return db('resolutions').where('id', id).del()
    }

    // Présences
    static async getPresences(agId) {
        const db = getDb()
        return db('presences_ag')
            .select(
                'presences_ag.*',
                'c.nom as coproprietaire_nom',
                'c.prenom as coproprietaire_prenom',
                'r.nom as represente_par_nom',
                'r.prenom as represente_par_prenom'
            )
            .join('coproprietaires as c', 'presences_ag.coproprietaire_id', 'c.id')
            .leftJoin('coproprietaires as r', 'presences_ag.represente_par_id', 'r.id')
            .where('presences_ag.ag_id', agId)
            .orderBy('c.nom', 'asc')
    }

    static async setPresence(data) {
        const db = getDb()
        const existing = await db('presences_ag')
            .where({ ag_id: data.ag_id, coproprietaire_id: data.coproprietaire_id })
            .first()
        if (existing) {
            const [result] = await db('presences_ag')
                .where('id', existing.id)
                .update({
                    statut: data.statut,
                    represente_par_id: data.represente_par_id || null,
                    tantiemes: data.tantiemes || 0,
                    updated_at: db.fn.now(),
                })
                .returning('*')
            return result
        }
        const [result] = await db('presences_ag')
            .insert({
                ag_id: data.ag_id,
                coproprietaire_id: data.coproprietaire_id,
                statut: data.statut || 'absent',
                represente_par_id: data.represente_par_id || null,
                tantiemes: data.tantiemes || 0,
            })
            .returning('*')
        return result
    }
}
