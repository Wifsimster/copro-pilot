import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ReglementCoproprieteModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('reglements_copropriete')
            .select('reglements_copropriete.*')
            .where('copropriete_id', coproprieteId)
            .orderBy('date_etablissement', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        const reglement = await db('reglements_copropriete')
            .where('id', id)
            .first()
        if (reglement) {
            reglement.articles = await db('articles_reglement')
                .where('reglement_id', id)
                .orderBy('ordre', 'asc')
                .orderBy('numero', 'asc')
        }
        return reglement
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('reglements_copropriete')
            .insert({
                copropriete_id: data.copropriete_id,
                date_etablissement: data.date_etablissement,
                date_derniere_modification: data.date_derniere_modification || null,
                notaire: data.notaire || null,
                destination_immeuble: data.destination_immeuble || 'habitation',
                restrictions_usage: data.restrictions_usage || null,
                conditions_travaux: data.conditions_travaux || null,
                composition_conseil_syndical: data.composition_conseil_syndical || null,
                modalites_convocation_ag: data.modalites_convocation_ag || null,
                document_url: data.document_url || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('reglements_copropriete')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('reglements_copropriete').where('id', id).del()
    }
}

export class ArticleReglementModel {
    static async getAllByReglement(reglementId) {
        const db = getDb()
        return db('articles_reglement')
            .where('reglement_id', reglementId)
            .orderBy('ordre', 'asc')
            .orderBy('numero', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('articles_reglement')
            .where('id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('articles_reglement')
            .insert({
                reglement_id: data.reglement_id,
                numero: data.numero,
                titre: data.titre,
                contenu: data.contenu || null,
                categorie: data.categorie || 'autre',
                ordre: data.ordre || 0,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('articles_reglement')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('articles_reglement').where('id', id).del()
    }
}
