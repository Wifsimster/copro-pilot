import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class PaiementModel {
    static async getAllByCoproprietaire(coproprietaireId) {
        const db = getDb()
        return db('paiements')
            .where('coproprietaire_id', coproprietaireId)
            .orderBy('date_paiement', 'desc')
    }

    static async getAllByAppelFonds(appelFondsId) {
        const db = getDb()
        return db('paiements')
            .select('paiements.*', 'coproprietaires.nom', 'coproprietaires.prenom')
            .join('coproprietaires', 'paiements.coproprietaire_id', 'coproprietaires.id')
            .where('appel_fonds_id', appelFondsId)
            .orderBy('date_paiement', 'desc')
    }

    static async getById(id) {
        const db = getDb()
        return db('paiements').where('id', id).first()
    }

    static async create(data) {
        const db = getDb()
        const [result] = await db('paiements')
            .insert({
                coproprietaire_id: data.coproprietaire_id,
                appel_fonds_id: data.appel_fonds_id || null,
                montant: data.montant,
                date_paiement: data.date_paiement,
                mode: data.mode || 'virement',
                reference: data.reference || null,
                notes: data.notes || null,
            })
            .returning('*')
        return result
    }

    static async update(id, data) {
        const db = getDb()
        const [result] = await db('paiements')
            .where('id', id)
            .update({
                montant: data.montant,
                date_paiement: data.date_paiement,
                mode: data.mode,
                reference: data.reference || null,
                notes: data.notes || null,
                updated_at: db.fn.now(),
            })
            .returning('*')
        return result
    }

    static async delete(id) {
        const db = getDb()
        return db('paiements').where('id', id).del()
    }

    // Solde d'un copropriétaire (total dû - total payé)
    static async getSoldeCoproprietaire(coproprietaireId) {
        const db = getDb()
        const [totalDu] = await db('appels_fonds_lignes')
            .where('coproprietaire_id', coproprietaireId)
            .sum('montant as total')
        const [totalPaye] = await db('paiements')
            .where('coproprietaire_id', coproprietaireId)
            .sum('montant as total')
        return {
            total_du: parseFloat(totalDu?.total || 0),
            total_paye: parseFloat(totalPaye?.total || 0),
            solde: parseFloat(totalPaye?.total || 0) - parseFloat(totalDu?.total || 0),
        }
    }
}
