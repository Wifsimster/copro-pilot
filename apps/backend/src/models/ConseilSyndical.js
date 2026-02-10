import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ConseilSyndicalModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('conseil_syndical')
            .select(
                'conseil_syndical.*',
                'coproprietaires.nom as coproprietaire_nom',
                'coproprietaires.prenom as coproprietaire_prenom',
                'coproprietaires.email as coproprietaire_email'
            )
            .leftJoin('coproprietaires', 'conseil_syndical.coproprietaire_id', 'coproprietaires.id')
            .where('conseil_syndical.copropriete_id', coproprieteId)
            .orderBy('conseil_syndical.role', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('conseil_syndical')
            .select(
                'conseil_syndical.*',
                'coproprietaires.nom as coproprietaire_nom',
                'coproprietaires.prenom as coproprietaire_prenom',
                'coproprietaires.email as coproprietaire_email'
            )
            .leftJoin('coproprietaires', 'conseil_syndical.coproprietaire_id', 'coproprietaires.id')
            .where('conseil_syndical.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('conseil_syndical')
            .insert({
                copropriete_id: data.copropriete_id,
                coproprietaire_id: data.coproprietaire_id,
                role: data.role || 'membre',
                date_election: data.date_election,
                date_fin_mandat: data.date_fin_mandat || null,
                ag_election_id: data.ag_election_id || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('conseil_syndical')
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
        return db('conseil_syndical').where('id', id).del()
    }
}
