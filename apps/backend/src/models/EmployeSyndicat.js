import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class EmployeSyndicatModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('employes_syndicat')
            .where('copropriete_id', coproprieteId)
            .orderBy('nom', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('employes_syndicat').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('employes_syndicat')
            .insert({
                copropriete_id: data.copropriete_id,
                nom: data.nom,
                prenom: data.prenom,
                poste: data.poste,
                type_contrat: data.type_contrat || 'cdi',
                date_embauche: data.date_embauche,
                date_fin: data.date_fin || null,
                salaire_brut: data.salaire_brut || null,
                logement_fonction: data.logement_fonction || false,
                statut: data.statut || 'actif',
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('employes_syndicat')
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
        return db('employes_syndicat').where('id', id).del()
    }
}
