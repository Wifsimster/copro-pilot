import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class DocumentModel {
    static async getAllByCopropriete(coproprieteId) {
        const db = getDb()
        return db('documents')
            .where('copropriete_id', coproprieteId)
            .orderBy('created_at', 'desc')
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
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('documents')
            .where('id', id)
            .update({ ...data, updated_at: db.fn.now() })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('documents').where('id', id).del()
    }
}
