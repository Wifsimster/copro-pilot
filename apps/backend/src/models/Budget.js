import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class BudgetModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('budgets_previsionnels')
            .where('copropriete_id', coproprieteId)
            .orderBy('annee', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('budgets_previsionnels').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('budgets_previsionnels')
            .insert({
                copropriete_id: data.copropriete_id,
                annee: data.annee,
                montant_total: data.montant_total || 0,
                statut: data.statut || 'brouillon',
                date_vote: data.date_vote || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('budgets_previsionnels')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('budgets_previsionnels').where('id', id).del()
    }

    // Postes de dépenses
    static async getPostes(budgetId) {
        const db = getDb()
        return db('postes_depenses')
            .select('postes_depenses.*', 'cles_repartition.nom as cle_nom')
            .leftJoin('cles_repartition', 'postes_depenses.cle_repartition_id', 'cles_repartition.id')
            .where('budget_id', budgetId)
            .orderBy('postes_depenses.nom', 'asc')
    }

    static async createPoste(data) {
        const db = getDb()
        const [result] = await db('postes_depenses')
            .insert({
                budget_id: data.budget_id,
                nom: data.nom,
                categorie: data.categorie || null,
                montant_prevu: data.montant_prevu || 0,
                montant_reel: data.montant_reel || null,
                cle_repartition_id: data.cle_repartition_id || null,
            })
            .returning('*')
        return result
    }

    static async updatePoste(id, data) {
        const db = getDb()
        const [result] = await db('postes_depenses')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async deletePoste(id) {
        const db = getDb()
        return db('postes_depenses').where('id', id).del()
    }
}
