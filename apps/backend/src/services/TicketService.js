import { TicketModel } from '../models/Ticket.js'
import logger from '../logger.js'

class TicketService {
  async getAllByCopropriete(coproprieteId) {
    try {
      return await TicketModel.getAllByCopropriete(coproprieteId)
    } catch (error) {
      logger.error(`[TicketService] Error getting tickets: ${error.message}`)
      throw error
    }
  }

  async getAllByUser(userId) {
    try {
      return await TicketModel.getAllByUser(userId)
    } catch (error) {
      logger.error(`[TicketService] Error getting tickets for user: ${error.message}`)
      throw error
    }
  }

  async getById(id) {
    try {
      return await TicketModel.getById(id)
    } catch (error) {
      logger.error(`[TicketService] Error getting ticket ${id}: ${error.message}`)
      throw error
    }
  }

  async create(data) {
    try {
      const result = await TicketModel.create(data)
      logger.info(`[TicketService] Ticket cree: ${result.sujet} (ID: ${result.id})`)
      return result
    } catch (error) {
      logger.error(`[TicketService] Error creating ticket: ${error.message}`)
      throw error
    }
  }

  async update(id, data) {
    try {
      const existing = await TicketModel.getById(id)
      if (!existing) return null
      const result = await TicketModel.update(id, data)
      logger.info(`[TicketService] Ticket mis a jour (ID: ${id})`)
      return result
    } catch (error) {
      logger.error(`[TicketService] Error updating ticket ${id}: ${error.message}`)
      throw error
    }
  }

  async delete(id) {
    try {
      const existing = await TicketModel.getById(id)
      if (!existing) return false
      await TicketModel.delete(id)
      logger.info(`[TicketService] Ticket supprime (ID: ${id})`)
      return true
    } catch (error) {
      logger.error(`[TicketService] Error deleting ticket ${id}: ${error.message}`)
      throw error
    }
  }

  async addMessage(ticketId, data) {
    try {
      const ticket = await TicketModel.getById(ticketId)
      if (!ticket) return null
      const result = await TicketModel.addMessage(ticketId, data)
      logger.info(`[TicketService] Message ajoute au ticket ${ticketId}`)
      return result
    } catch (error) {
      logger.error(`[TicketService] Error adding message to ticket ${ticketId}: ${error.message}`)
      throw error
    }
  }

  async getMessages(ticketId) {
    try {
      return await TicketModel.getMessages(ticketId)
    } catch (error) {
      logger.error(`[TicketService] Error getting messages for ticket ${ticketId}: ${error.message}`)
      throw error
    }
  }
}

export const ticketService = new TicketService()
