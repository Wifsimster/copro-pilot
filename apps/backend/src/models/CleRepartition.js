import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class CleRepartitionModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('cles_repartition')
            .where('copropriete_id', coproprieteId)
            .orderBy('nom', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('cles_repartition').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('cles_repartition')
            .insert({
                copropriete_id: data.copropriete_id,
                nom: data.nom,
                description: data.description || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('cles_repartition')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('cles_repartition').where('id', id).del()
    }

    static async getLotQuoteParts(cleId) {
        const db = getDb()
        return db('lot_cles_repartition')
            .select('lot_cles_repartition.*', 'lots.numero as lot_numero', 'lots.type as lot_type')
            .join('lots', 'lot_cles_repartition.lot_id', 'lots.id')
            .where('lot_cles_repartition.cle_repartition_id', cleId)
            .orderBy('lots.numero', 'asc')
    }

    static async setLotQuotePart(lotId, cleRepartitionId, quotePart) {
        const db = getDb()
        const existing = await db('lot_cles_repartition')
            .where({ lot_id: lotId, cle_repartition_id: cleRepartitionId })
            .first()

        if (existing) {
            const [result] = await db('lot_cles_repartition')
                .where({ lot_id: lotId, cle_repartition_id: cleRepartitionId })
                .update({ quote_part: quotePart, updated_at: db.fn.now() })
                .returning('*')
            return result
        }

        const [result] = await db('lot_cles_repartition')
            .insert({ lot_id: lotId, cle_repartition_id: cleRepartitionId, quote_part: quotePart })
            .returning('*')
        return result
    }

    static async removeLotQuotePart(lotId, cleRepartitionId) {
        const db = getDb()
        return db('lot_cles_repartition')
            .where({ lot_id: lotId, cle_repartition_id: cleRepartitionId })
            .del()
    }
}
