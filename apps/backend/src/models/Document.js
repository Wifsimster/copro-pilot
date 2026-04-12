import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class DocumentModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('documents')
            .where('copropriete_id', coproprieteId)
            .orderBy('created_at', 'desc')
    }

    static async getAllByEntity(entiteType, entiteId) {
        const db = getDb()
        return db('documents')
            .where('entite_type', entiteType)
            .where('entite_id', entiteId)
            .orderBy('created_at', 'desc')
    }

    static async getByFilters(coproprieteId, { categorie, entiteType, search } = {}) {
        const db = getDb()
        const query = db('documents')
            .where('copropriete_id', coproprieteId)

        if (categorie) {
            query.where('categorie', categorie)
        }

        if (entiteType) {
            query.where('entite_type', entiteType)
        }

        if (search) {
            query.where(function () {
                this.whereILike('nom', `%${search}%`)
                    .orWhereILike('description', `%${search}%`)
                    .orWhereILike('fichier_nom', `%${search}%`)
            })
        }

        return query.orderBy('created_at', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('documents').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('documents')
            .insert({
                copropriete_id: data.copropriete_id,
                nom: data.nom,
                categorie: data.categorie || 'autre',
                fichier_nom: data.fichier_nom,
                fichier_path: data.fichier_path,
                mime_type: data.mime_type || null,
                taille: data.taille || null,
                description: data.description || null,
                entite_type: data.entite_type || null,
                entite_id: data.entite_id || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const allowedFields = ['nom', 'categorie', 'description', 'entite_type', 'entite_id']
        const sanitized = Object.fromEntries(
            Object.entries(data).filter(([key]) => allowedFields.includes(key))
        )
        const [result] = await db('documents')
            .where('id', id)
            .update({ ...sanitized, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('documents').where('id', id).del()
    }
}
