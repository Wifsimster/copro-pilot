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

    static async getById(id) {
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
            .where('mutations.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        return db.transaction(async trx => {
            const [result] = await trx('mutations')
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
                await trx('lots')
                    .where('id', data.lot_id)
                    .update({
                        coproprietaire_id: data.nouveau_proprietaire_id,
                        updated_at: trx.fn.now(),
                    })
            }

            return result
        })
    }

    static async update(id, data) {
        const db = getDb()
        return db.transaction(async trx => {
            const [result] = await trx('mutations')
                .where('id', id)
                .update({
                    ancien_proprietaire_id: data.ancien_proprietaire_id || null,
                    nouveau_proprietaire_id: data.nouveau_proprietaire_id || null,
                    date_mutation: data.date_mutation,
                    type: data.type,
                    notes: data.notes || null,
                    updated_at: trx.fn.now(),
                })
                .returning('*')

            if (data.nouveau_proprietaire_id && result?.lot_id) {
                await trx('lots')
                    .where('id', result.lot_id)
                    .update({
                        coproprietaire_id: data.nouveau_proprietaire_id,
                        updated_at: trx.fn.now(),
                    })
            }

            return result
        })
    }

    static async delete(id) {
        const db = getDb()
        return db('mutations').where('id', id).del()
    }
}
