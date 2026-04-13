import crypto from 'crypto'
import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

const computeHash = data => {
  const payload = JSON.stringify({
    resolution_id: data.resolution_id,
    coproprietaire_id: data.coproprietaire_id,
    vote: data.vote,
    poids_voix: data.poids_voix,
    mode: data.mode,
    date_vote: data.date_vote || new Date().toISOString(),
  })
  return crypto.createHash('sha256').update(payload).digest('hex')
}

export class VoteElectroniqueModel {
  static async getByResolution(resolutionId) {
    const db = getDb()
    return db('votes_electroniques')
      .select(
        'votes_electroniques.*',
        'c.nom as coproprietaire_nom',
        'c.prenom as coproprietaire_prenom'
      )
      .join(
        'coproprietaires as c',
        'votes_electroniques.coproprietaire_id',
        'c.id'
      )
      .where('votes_electroniques.resolution_id', resolutionId)
      .orderBy('votes_electroniques.date_vote', 'asc')
  }

  static async getByAg(agId) {
    const db = getDb()
    return db('votes_electroniques')
      .select(
        'votes_electroniques.*',
        'r.numero as resolution_numero',
        'r.titre as resolution_titre',
        'c.nom as coproprietaire_nom',
        'c.prenom as coproprietaire_prenom'
      )
      .join('resolutions as r', 'votes_electroniques.resolution_id', 'r.id')
      .join(
        'coproprietaires as c',
        'votes_electroniques.coproprietaire_id',
        'c.id'
      )
      .where('r.ag_id', agId)
      .orderBy(['r.numero', 'votes_electroniques.date_vote'])
  }

  static async getByCoproprietaire(coproprietaireId, agId) {
    const db = getDb()
    return db('votes_electroniques')
      .select(
        'votes_electroniques.*',
        'r.numero as resolution_numero',
        'r.titre as resolution_titre'
      )
      .join('resolutions as r', 'votes_electroniques.resolution_id', 'r.id')
      .where('votes_electroniques.coproprietaire_id', coproprietaireId)
      .andWhere('r.ag_id', agId)
      .orderBy('r.numero', 'asc')
  }

  static async create(data) {
    const db = getDb()
    const dateVote = data.date_vote || new Date()
    const hash = computeHash({ ...data, date_vote: dateVote })
    const [result] = await db('votes_electroniques')
      .insert({
        resolution_id: data.resolution_id,
        coproprietaire_id: data.coproprietaire_id,
        vote: data.vote,
        poids_voix: data.poids_voix,
        mode: data.mode,
        date_vote: dateVote,
        ip_address: data.ip_address || null,
        hash,
      })
      .returning('*')
    return result
  }

  static async getTally(resolutionId) {
    const db = getDb()
    const rows = await db('votes_electroniques')
      .select('vote')
      .sum({ total: 'poids_voix' })
      .where('resolution_id', resolutionId)
      .groupBy('vote')

    const tally = { pour: 0, contre: 0, abstention: 0, total_voix: 0 }
    for (const row of rows) {
      const total = parseInt(row.total, 10) || 0
      if (row.vote === 'pour') tally.pour = total
      else if (row.vote === 'contre') tally.contre = total
      else if (row.vote === 'abstention') tally.abstention = total
      tally.total_voix += total
    }
    return tally
  }

  static async hasVoted(resolutionId, coproprietaireId) {
    const db = getDb()
    const existing = await db('votes_electroniques')
      .where({
        resolution_id: resolutionId,
        coproprietaire_id: coproprietaireId,
      })
      .first()
    return Boolean(existing)
  }
}
