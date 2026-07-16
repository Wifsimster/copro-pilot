import knexDatabase from '../config/knex-database.js'
import { maybeEncrypt, maybeDecrypt } from '../utils/encryption.js'

const getDb = () => knexDatabase.getKnex()

function decryptRow(row) {
  if (!row) return row
  if (row.iban !== undefined && row.iban !== null) {
    return { ...row, iban: maybeDecrypt(row.iban) }
  }
  return row
}

function decryptRows(rows) {
  if (!Array.isArray(rows)) return rows
  return rows.map(decryptRow)
}

export class CompteBancaireModel {
  static async getAllByCopropriete(coproprieteId) {
    const db = getDb()
    const rows = await db('comptes_bancaires')
      .where('copropriete_id', coproprieteId)
      .orderBy('type', 'asc')
    return decryptRows(rows)
  }

  static async getById(id) {
    const db = getDb()
    const row = await db('comptes_bancaires').where('id', id).first()
    return decryptRow(row)
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('comptes_bancaires')
      .insert({
        copropriete_id: data.copropriete_id,
        banque: data.banque,
        iban: maybeEncrypt(data.iban),
        bic: data.bic || null,
        type: data.type || 'courant',
        libelle: data.libelle || null,
        solde: data.solde || 0,
        date_ouverture: data.date_ouverture || null,
        actif: data.actif !== undefined ? data.actif : true,
        est_compte_separe:
          data.est_compte_separe !== undefined
            ? data.est_compte_separe
            : true,
        notes: data.notes || null,
      })
      .returning('*')
    return decryptRow(result)
  }

  static async update(id, data) {
    const db = getDb()
    const payload = { ...data, updated_at: db.fn.now() }
    if (Object.prototype.hasOwnProperty.call(payload, 'iban')) {
      payload.iban = maybeEncrypt(payload.iban)
    }
    const [result] = await db('comptes_bancaires')
      .where('id', id)
      .update(payload)
      .returning('*')
    return decryptRow(result)
  }

  static async delete(id) {
    const db = getDb()
    return db('comptes_bancaires').where('id', id).del()
  }

  static async getSoldeTotal(coproprieteId) {
    const db = getDb()
    const result = await db('comptes_bancaires')
      .where({ copropriete_id: coproprieteId, actif: true })
      .sum('solde as total')
      .first()
    return parseFloat(result?.total || 0)
  }

  /**
   * Loi Hoguet / art. 18 : a copropriété must hold its funds on a dedicated
   * separate account. Returns true when it has at least one active account
   * flagged `est_compte_separe`.
   */
  static async hasSeparateAccount(coproprieteId) {
    const db = getDb()
    const row = await db('comptes_bancaires')
      .where({
        copropriete_id: coproprieteId,
        actif: true,
        est_compte_separe: true,
      })
      .count('id as count')
      .first()
    return parseInt(row?.count || 0, 10) > 0
  }
}
