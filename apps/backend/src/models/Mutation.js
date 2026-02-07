import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class MutationModel {
    static async getAllByLot(lotId) {
        const db = getDb()
        return db('mutations')
            .select(
                'mutations.*',
                'ancien.nom as ancien_nom',
                'ancien.prenom as ancien_prenom',
                'nouveau.nom as nouveau_nom',
                'nouveau.prenom as nouveau_prenom'
            )
            .leftJoin('coproprietaires as ancien', 'mutations.ancien_proprietaire_id', 'ancien.id')
            .leftJoin('coproprietaires as nouveau', 'mutations.nouveau_proprietaire_id', 'nouveau.id')
            .where('mutations.lot_id', lotId)
            .orderBy('mutations.date_mutation', 'desc')
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('mutations')
            .insert({
                lot_id: data.lot_id,
                ancien_proprietaire_id: data.ancien_proprietaire_id || null,
                nouveau_proprietaire_id: data.nouveau_proprietaire_id || null,
                date_mutation: data.date_mutation,
                type: data.type || 'vente',
                notes: data.notes || null,
            })
            .returning('*')

        // Update lot owner
        if (data.nouveau_proprietaire_id) {
            await db('lots')
                .where('id', data.lot_id)
                .update({
                    coproprietaire_id: data.nouveau_proprietaire_id,
                    updated_at: db.fn.now(),
                })
        }

        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('mutations')
            .where('id', id)
            .update({
                ancien_proprietaire_id: data.ancien_proprietaire_id || null,
                nouveau_proprietaire_id: data.nouveau_proprietaire_id || null,
                date_mutation: data.date_mutation,
                type: data.type,
                notes: data.notes || null,
                updated_at: db.fn.now(),
            })
            .returning('*')

        if (data.nouveau_proprietaire_id && result.lot_id) {
            await db('lots')
                .where('id', result.lot_id)
                .update({
                    coproprietaire_id: data.nouveau_proprietaire_id,
                    updated_at: db.fn.now(),
                })
        }

        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('mutations').where('id', id).del()
    }
}
