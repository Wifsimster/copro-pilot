import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class SearchModel {
  static async searchCoproprietes(query, limit = 5, coproprieteIds = null) {
    const db = getDb()
    const qb = db('coproprietes')
      .select('id', 'nom', 'adresse', 'ville', 'code_postal')
      .where(function () {
        this.where('nom', 'ilike', `%${query}%`)
          .orWhere('adresse', 'ilike', `%${query}%`)
          .orWhere('ville', 'ilike', `%${query}%`)
      })
      .orderBy('nom', 'asc')
      .limit(limit)
    if (coproprieteIds) {
      qb.whereIn('id', coproprieteIds)
    }
    return qb
  }

  static async searchCoproprietaires(query, limit = 5, coproprieteIds = null) {
    const db = getDb()
    const qb = db('coproprietaires')
      .select('id', 'nom', 'prenom', 'email')
      .where(function () {
        this.where('nom', 'ilike', `%${query}%`)
          .orWhere('prenom', 'ilike', `%${query}%`)
          .orWhere('email', 'ilike', `%${query}%`)
      })
      .orderBy('nom', 'asc')
      .limit(limit)
    if (coproprieteIds) {
      qb.whereIn('id', function () {
        this.select('coproprietaire_id')
          .from('lots')
          .whereIn('copropriete_id', coproprieteIds)
          .whereNotNull('coproprietaire_id')
      })
    }
    return qb
  }

  static async searchContrats(query, coproprieteId, limit = 5, coproprieteIds = null) {
    const db = getDb()
    const qb = db('contrats')
      .select(
        'contrats.id',
        'contrats.objet',
        'contrats.type',
        'contrats.statut',
        'prestataires.nom as prestataire_nom'
      )
      .leftJoin('prestataires', 'contrats.prestataire_id', 'prestataires.id')
      .where(function () {
        this.where('contrats.objet', 'ilike', `%${query}%`)
          .orWhere('prestataires.nom', 'ilike', `%${query}%`)
      })
      .orderBy('contrats.objet', 'asc')
      .limit(limit)
    if (coproprieteId) {
      qb.andWhere('contrats.copropriete_id', coproprieteId)
    }
    if (coproprieteIds) {
      qb.whereIn('contrats.copropriete_id', coproprieteIds)
    }
    return qb
  }

  static async searchIncidents(query, coproprieteId, limit = 5, coproprieteIds = null) {
    const db = getDb()
    const qb = db('incidents')
      .select('id', 'titre', 'categorie', 'urgence', 'statut')
      .where(function () {
        this.where('titre', 'ilike', `%${query}%`)
          .orWhere('description', 'ilike', `%${query}%`)
      })
      .orderBy('created_at', 'desc')
      .limit(limit)
    if (coproprieteId) {
      qb.andWhere('copropriete_id', coproprieteId)
    }
    if (coproprieteIds) {
      qb.whereIn('copropriete_id', coproprieteIds)
    }
    return qb
  }

  static async searchDocuments(query, coproprieteId, limit = 5, coproprieteIds = null) {
    const db = getDb()
    const qb = db('documents')
      .select('id', 'nom', 'categorie')
      .where('nom', 'ilike', `%${query}%`)
      .orderBy('nom', 'asc')
      .limit(limit)
    if (coproprieteId) {
      qb.andWhere('copropriete_id', coproprieteId)
    }
    if (coproprieteIds) {
      qb.whereIn('copropriete_id', coproprieteIds)
    }
    return qb
  }

  static async searchAssemblees(query, coproprieteId, limit = 5, coproprieteIds = null) {
    const db = getDb()
    const qb = db('assemblees_generales')
      .select('id', 'date', 'type', 'statut', 'lieu')
      .where(function () {
        this.where('type', 'ilike', `%${query}%`)
          .orWhere('lieu', 'ilike', `%${query}%`)
          .orWhere('ordre_du_jour', 'ilike', `%${query}%`)
      })
      .orderBy('date', 'desc')
      .limit(limit)
    if (coproprieteId) {
      qb.andWhere('copropriete_id', coproprieteId)
    }
    if (coproprieteIds) {
      qb.whereIn('copropriete_id', coproprieteIds)
    }
    return qb
  }

  static async searchAssurances(query, coproprieteId, limit = 5, coproprieteIds = null) {
    const db = getDb()
    const qb = db('assurances')
      .select('id', 'compagnie', 'numero_police', 'type', 'statut')
      .where(function () {
        this.where('compagnie', 'ilike', `%${query}%`)
          .orWhere('numero_police', 'ilike', `%${query}%`)
      })
      .orderBy('compagnie', 'asc')
      .limit(limit)
    if (coproprieteId) {
      qb.andWhere('copropriete_id', coproprieteId)
    }
    if (coproprieteIds) {
      qb.whereIn('copropriete_id', coproprieteIds)
    }
    return qb
  }
}
