import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class LotModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('lots')
            .select(
                'lots.*',
                'coproprietaires.nom as proprietaire_nom',
                'coproprietaires.prenom as proprietaire_prenom'
            )
            .leftJoin('coproprietaires', 'lots.coproprietaire_id', 'coproprietaires.id')
            .where('lots.copropriete_id', coproprieteId)
            .orderBy('lots.numero', 'asc')
    }

    static async getById(id) {
        const db = getDb()
        return db('lots')
            .select(
                'lots.*',
                'coproprietaires.nom as proprietaire_nom',
                'coproprietaires.prenom as proprietaire_prenom',
                'coproprietaires.email as proprietaire_email'
            )
            .leftJoin('coproprietaires', 'lots.coproprietaire_id', 'coproprietaires.id')
            .where('lots.id', id)
            .first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('lots')
            .insert({
                copropriete_id: data.copropriete_id,
                coproprietaire_id: data.coproprietaire_id || null,
                numero: data.numero,
                type: data.type || 'appartement',
                surface: data.surface || null,
                etage: data.etage !== undefined ? data.etage : null,
                tantiemes: data.tantiemes || 0,
                description: data.description || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('lots')
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
        return db('lots').where('id', id).del()
    }

    static async getClesRepartition(lotId) {
        const db = getDb()
        return db('lot_cles_repartition')
            .select('lot_cles_repartition.*', 'cles_repartition.nom as cle_nom')
            .join('cles_repartition', 'lot_cles_repartition.cle_repartition_id', 'cles_repartition.id')
            .where('lot_cles_repartition.lot_id', lotId)
    }
}
