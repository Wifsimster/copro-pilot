import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class CoproprietaireModel {
    static async getAll() {
        const db = getDb()
        return db('coproprietaires')
            .select('*')
            .orderBy('nom', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('coproprietaires').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('coproprietaires')
            .insert({
                nom: data.nom,
                prenom: data.prenom,
                email: data.email || null,
                telephone: data.telephone || null,
                adresse_correspondance: data.adresse_correspondance || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('coproprietaires')
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
        return db('coproprietaires').where('id', id).del()
    }

    static async getLots(coproprietaireId) {
        const db = getDb()
        return db('lots')
            .select('lots.*', 'coproprietes.nom as copropriete_nom')
            .join('coproprietes', 'lots.copropriete_id', 'coproprietes.id')
            .where('lots.coproprietaire_id', coproprietaireId)
            .orderBy('coproprietes.nom', 'asc')
    }

    static async search(query) {
        const db = getDb()
        return db('coproprietaires')
            .where('nom', 'ilike', `%${query}%`)
            .orWhere('prenom', 'ilike', `%${query}%`)
            .orWhere('email', 'ilike', `%${query}%`)
            .orderBy('nom', 'asc')
            .limit(20)
    }
}
