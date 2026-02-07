import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class AppelFondsModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('appels_fonds')
            .where('copropriete_id', coproprieteId)
            .orderBy([{ column: 'annee', order: 'desc' }, { column: 'trimestre', order: 'desc' }])
    }

    static async getById(id) {
        const db = getDb()
        return db('appels_fonds').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('appels_fonds')
            .insert({
                copropriete_id: data.copropriete_id,
                budget_id: data.budget_id || null,
                trimestre: data.trimestre,
                annee: data.annee,
                montant_total: data.montant_total,
                date_emission: data.date_emission,
                date_echeance: data.date_echeance,
                statut: data.statut || 'brouillon',
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('appels_fonds')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('appels_fonds').where('id', id).del()
    }

    static async getLignes(appelFondsId) {
        const db = getDb()
        return db('appels_fonds_lignes')
            .select(
                'appels_fonds_lignes.*',
                'lots.numero as lot_numero',
                'coproprietaires.nom as coproprietaire_nom',
                'coproprietaires.prenom as coproprietaire_prenom'
            )
            .join('lots', 'appels_fonds_lignes.lot_id', 'lots.id')
            .leftJoin('coproprietaires', 'appels_fonds_lignes.coproprietaire_id', 'coproprietaires.id')
            .where('appels_fonds_lignes.appel_fonds_id', appelFondsId)
            .orderBy('lots.numero', 'asc')
    }

    static async createLigne(data) {
        const db = getDb()
        const [result] = await db('appels_fonds_lignes')
            .insert({
                appel_fonds_id: data.appel_fonds_id,
                lot_id: data.lot_id,
                coproprietaire_id: data.coproprietaire_id || null,
                montant: data.montant,
            })
            .returning('*')
        return result
    }

    static async updateLigne(id, data) {
        const db = getDb()
        const [result] = await db('appels_fonds_lignes')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async deleteLigne(id) {
        const db = getDb()
        return db('appels_fonds_lignes').where('id', id).del()
    }
}
