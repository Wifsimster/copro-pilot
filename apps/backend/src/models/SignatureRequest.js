import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class SignatureRequestModel {
  static async getById(id) {
    const db = getDb()
    const request = await db('signature_requests').where('id', id).first()
    if (!request) return null
    const signatories = await db('signature_signatories')
      .where('signature_request_id', id)
      .orderBy('id', 'asc')
    return { ...request, signatories }
  }

  static async getByProviderRequestId(providerRequestId) {
    const db = getDb()
    const request = await db('signature_requests')
      .where('provider_request_id', providerRequestId)
      .first()
    if (!request) return null
    const signatories = await db('signature_signatories')
      .where('signature_request_id', request.id)
      .orderBy('id', 'asc')
    return { ...request, signatories }
  }

  static async getByDocument(documentId) {
    const db = getDb()
    return db('signature_requests')
      .where('document_id', documentId)
      .orderBy('created_at', 'desc')
  }

  static async getByAg(agId) {
    const db = getDb()
    return db('signature_requests')
      .where('ag_id', agId)
      .orderBy('created_at', 'desc')
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('signature_requests')
      .insert({
        document_id: data.document_id,
        ag_id: data.ag_id || null,
        provider: data.provider || 'yousign',
        provider_request_id: data.provider_request_id || null,
        statut: data.statut || 'created',
        requested_by: data.requested_by || null,
        expires_at: data.expires_at || null,
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const allowedFields = [
      'provider_request_id',
      'statut',
      'expires_at',
    ]
    const sanitized = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    )
    const [result] = await db('signature_requests')
      .where('id', id)
      .update({ ...sanitized, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('signature_requests').where('id', id).del()
  }

  static async addSignatory(requestId, data) {
    const db = getDb()
    const [result] = await db('signature_signatories')
      .insert({
        signature_request_id: requestId,
        coproprietaire_id: data.coproprietaire_id || null,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
        statut: data.statut || 'pending',
        signature_url: data.signature_url || null,
      })
      .returning('*')
    return result
  }

  static async updateSignatoryStatus(id, statut) {
    const db = getDb()
    const updates = { statut }
    if (statut === 'signed') {
      updates.signed_at = new Date()
    }
    const [result] = await db('signature_signatories')
      .where('id', id)
      .update(updates)
      .returning('*')
    return result
  }

  static async getSignatoriesByRequest(requestId) {
    const db = getDb()
    return db('signature_signatories')
      .where('signature_request_id', requestId)
      .orderBy('id', 'asc')
  }

  static async findSignatoryByEmail(requestId, email) {
    const db = getDb()
    return db('signature_signatories')
      .where({ signature_request_id: requestId, email })
      .first()
  }
}
