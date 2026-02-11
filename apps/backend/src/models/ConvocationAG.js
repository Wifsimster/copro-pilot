import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ConvocationAGModel {
    // Get all convocations for an AG
    static async getByAgId(agId) {
        const db = getDb()
        return db('convocations_ag')
            .where('ag_id', agId)
            .orderBy('created_at', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('convocations_ag').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('convocations_ag')
            .insert({
                ag_id: data.ag_id,
                date_envoi: data.date_envoi || null,
                mode_envoi: data.mode_envoi || 'email',
                statut: data.statut || 'brouillon',
                contenu: data.contenu || null,
                documents_annexes: data.documents_annexes || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('convocations_ag')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('convocations_ag').where('id', id).del()
    }

    // Destinataires
    static async getDestinataires(convocationId) {
        const db = getDb()
        return db('destinataires_convocation')
            .select(
                'destinataires_convocation.*',
                'c.nom as coproprietaire_nom',
                'c.prenom as coproprietaire_prenom',
                'c.email as coproprietaire_email'
            )
            .join('coproprietaires as c', 'destinataires_convocation.coproprietaire_id', 'c.id')
            .where('destinataires_convocation.convocation_id', convocationId)
            .orderBy('c.nom', 'asc')
    }

    static async addDestinataire(data) {
        const db = getDb()
        const existing = await db('destinataires_convocation')
            .where({ convocation_id: data.convocation_id, coproprietaire_id: data.coproprietaire_id })
            .first()
        if (existing) {
            const [result] = await db('destinataires_convocation')
                .where('id', existing.id)
                .update({
                    statut: data.statut || existing.statut,
                    date_envoi: data.date_envoi || existing.date_envoi,
                    date_reception: data.date_reception || existing.date_reception,
                    date_ar: data.date_ar || existing.date_ar,
                    mode_envoi: data.mode_envoi || existing.mode_envoi,
                    email_envoye_a: data.email_envoye_a || existing.email_envoye_a,
                    notes: data.notes !== undefined ? data.notes : existing.notes,
                    updated_at: db.fn.now(),
                })
                .returning('*')
            return result
        }
        const [result] = await db('destinataires_convocation')
            .insert({
                convocation_id: data.convocation_id,
                coproprietaire_id: data.coproprietaire_id,
                statut: data.statut || 'en_attente',
                date_envoi: data.date_envoi || null,
                date_reception: data.date_reception || null,
                date_ar: data.date_ar || null,
                mode_envoi: data.mode_envoi || null,
                email_envoye_a: data.email_envoye_a || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async updateDestinataire(id, data) {
        const db = getDb()
        const [result] = await db('destinataires_convocation')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async deleteDestinataire(id) {
        const db = getDb()
        return db('destinataires_convocation').where('id', id).del()
    }

    // Generate convocation: auto-add all coproprietaires of the copropriete
    static async genererDestinataires(convocationId, coproprieteId) {
        const db = getDb()
        // Get unique coproprietaires owning lots in this copropriete
        const coproprietaires = await db('lots')
            .select('lots.coproprietaire_id', 'coproprietaires.email')
            .join('coproprietaires', 'lots.coproprietaire_id', 'coproprietaires.id')
            .where('lots.copropriete_id', coproprieteId)
            .whereNotNull('lots.coproprietaire_id')
            .groupBy('lots.coproprietaire_id', 'coproprietaires.email')

        const inserted = []
        for (const copro of coproprietaires) {
            const [result] = await db('destinataires_convocation')
                .insert({
                    convocation_id: convocationId,
                    coproprietaire_id: copro.coproprietaire_id,
                    statut: 'en_attente',
                    email_envoye_a: copro.email || null,
                })
                .onConflict(['convocation_id', 'coproprietaire_id'])
                .ignore()
                .returning('*')
            if (result) inserted.push(result)
        }
        return inserted
    }

    // Validate 21-day delay
    static async verifierDelai(agId) {
        const db = getDb()
        const ag = await db('assemblees_generales').where('id', agId).first()
        if (!ag) return { valide: false, message: 'AG non trouvée' }

        const agDate = new Date(ag.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffDays = Math.ceil((agDate - today) / (1000 * 60 * 60 * 24))

        return {
            valide: diffDays >= 21,
            jours_restants: diffDays,
            date_ag: ag.date,
            date_limite_envoi: new Date(agDate.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            message: diffDays >= 21
                ? `Délai respecté (${diffDays} jours avant l'AG)`
                : diffDays > 0
                    ? `Attention: seulement ${diffDays} jours avant l'AG (minimum légal: 21 jours)`
                    : 'L\'AG est déjà passée'
        }
    }
}
