import knexDatabase from '../config/knex-database.js'

const getDb = () => knexDatabase.getKnex()

export class TicketModel {
  static async getAllByCopropriete(coproprieteId) {
    const db = getDb()
    return db('tickets')
      .select(
        'tickets.*',
        'user.name as auteur_nom',
        db.raw('(SELECT COUNT(*) FROM ticket_messages WHERE ticket_messages.ticket_id = tickets.id)::int as messages_count')
      )
      .leftJoin('user', 'tickets.auteur_id', 'user.id')
      .where('tickets.copropriete_id', coproprieteId)
      .orderBy('tickets.created_at', 'desc')
  }

  static async getAllByUser(userId) {
    const db = getDb()
    return db('tickets')
      .select(
        'tickets.*',
        'user.name as auteur_nom',
        db.raw('(SELECT COUNT(*) FROM ticket_messages WHERE ticket_messages.ticket_id = tickets.id)::int as messages_count')
      )
      .leftJoin('user', 'tickets.auteur_id', 'user.id')
      .where('tickets.auteur_id', userId)
      .orderBy('tickets.created_at', 'desc')
  }

  static async getById(id) {
    const db = getDb()
    const ticket = await db('tickets')
      .select(
        'tickets.*',
        'user.name as auteur_nom'
      )
      .leftJoin('user', 'tickets.auteur_id', 'user.id')
      .where('tickets.id', id)
      .first()

    if (ticket) {
      ticket.messages = await TicketModel.getMessages(id)
    }

    return ticket
  }

  static async create(data) {
    const db = getDb()
    const [result] = await db('tickets')
      .insert({
        copropriete_id: data.copropriete_id,
        auteur_id: data.auteur_id,
        sujet: data.sujet,
        categorie: data.categorie || 'general',
        statut: data.statut || 'ouvert',
        priorite: data.priorite || 'normale',
      })
      .returning('*')
    return result
  }

  static async update(id, data) {
    const db = getDb()
    const allowedFields = [
      'sujet', 'categorie', 'statut', 'priorite',
    ]
    const sanitized = Object.fromEntries(
      Object.entries(data).filter(([key]) => allowedFields.includes(key))
    )
    const [result] = await db('tickets')
      .where('id', id)
      .update({ ...sanitized, updated_at: db.fn.now() })
      .returning('*')
    return result
  }

  static async delete(id) {
    const db = getDb()
    return db('tickets').where('id', id).del()
  }

  static async addMessage(ticketId, data) {
    const db = getDb()
    const [result] = await db('ticket_messages')
      .insert({
        ticket_id: ticketId,
        auteur_id: data.auteur_id,
        contenu: data.contenu,
      })
      .returning('*')

    // Update ticket updated_at
    await db('tickets')
      .where('id', ticketId)
      .update({ updated_at: db.fn.now() })

    return result
  }

  static async getMessages(ticketId) {
    const db = getDb()
    return db('ticket_messages')
      .select(
        'ticket_messages.*',
        'user.name as auteur_nom'
      )
      .leftJoin('user', 'ticket_messages.auteur_id', 'user.id')
      .where('ticket_messages.ticket_id', ticketId)
      .orderBy('ticket_messages.created_at', 'asc')
  }
}
