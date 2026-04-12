import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class ContratModel {
  static async getAllByCopropriete(coproprieteId) {
    const db = getDb()
    return db('contrats')
      .select('contrats.*', 'prestataires.nom as prestataire_nom', 'prestataires.specialite as prestataire_specialite')
      .join('prestataires', 'contrats.prestataire_id', 'prestataires.id')
      .where('contrats.copropriete_id', coproprieteId)
      .orderBy('contrats.date_debut', 'desc')
  }

  static async getAllByCoproprietePaginated(coproprieteId, { limit, offset, sortBy, sortOrder }) {
    const db = getDb()
    const [{ count }] = await db('contrats')
      .where('copropriete_id', coproprieteId)
      .count('id as count')
    const data = await db('contrats')
      .select('contrats.*', 'prestataires.nom as prestataire_nom', 'prestataires.specialite as prestataire_specialite')
      .join('prestataires', 'contrats.prestataire_id', 'prestataires.id')
      .where('contrats.copropriete_id', coproprieteId)
      .orderBy(sortBy, sortOrder)
      .limit(limit)
      .offset(offset)
    return { data, total: parseInt(count) }
  }

  static async getById(id) {
    const db = getDb()
    return db('contrats')
      .select('contrats.*', 'prestataires.nom as prestataire_nom', 'prestataires.specialite as prestataire_specialite')
      .join('prestataires', 'contrats.prestataire_id', 'prestataires.id')
      .where('contrats.id', id)
      .first()
  }

  static async getByPrestataire(prestataireId) {
    const db = getDb()
    return db('contrats')
      .select('contrats.*', 'prestataires.nom as prestataire_nom')
      .join('prestataires', 'contrats.prestataire_id', 'prestataires.id')
      .where('contrats.prestataire_id', prestataireId)
      .orderBy('contrats.date_debut', 'desc')
  }

  static async getExpiringSoon(coproprieteId, daysAhead = 90) {
    const db = getDb()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)
    return db('contrats')
      .select('contrats.*', 'prestataires.nom as prestataire_nom')
      .join('prestataires', 'contrats.prestataire_id', 'prestataires.id')
      .where('contrats.copropriete_id', coproprieteId)
      .where('contrats.statut', 'actif')
      .whereNotNull('contrats.date_fin')
      .where('contrats.date_fin', '<=', futureDate.toISOString().split('T')[0])
      .orderBy('contrats.date_fin', 'asc')
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('contrats')
      .insert({
        copropriete_id: data.copropriete_id,
        prestataire_id: data.prestataire_id,
        objet: data.objet,
        type: data.type || null,
        date_debut: data.date_debut,
        date_fin: data.date_fin || null,
        montant_annuel: data.montant_annuel || null,
        frequence_paiement: data.frequence_paiement || 'annuel',
        conditions_resiliation: data.conditions_resiliation || null,
        preavis_mois: data.preavis_mois || null,
        reconduction_tacite: data.reconduction_tacite !== undefined ? data.reconduction_tacite : true,
        statut: data.statut || 'actif',
        notes: data.notes || null,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const [result] = await db('contrats')
      .where('id', id)
      .update({ ...data, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('contrats').where('id', id).del()
  }
}
