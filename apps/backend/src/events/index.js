import { EventBus } from './EventBus.js'
import SseManager from './SseManager.js'
import { DomainEventModel } from '../models/DomainEvent.js'
import { registerSseHandlers } from './handlers/SseHandler.js'
import logger from '../logger.js'

let eventBus = null
let sseManager = null

export function initializeEvents() {
  sseManager = new SseManager()

  eventBus = new EventBus({
    eventStore: DomainEventModel,
    logger,
  })

  registerSseHandlers(eventBus, sseManager)

  logger.info('[Events] Event system initialized')

  return { eventBus, sseManager }
}

export function getEventBus() {
  if (!eventBus) {
    throw new Error(
      'EventBus not initialized — call initializeEvents() first'
    )
  }
  return eventBus
}

export function getSseManager() {
  if (!sseManager) {
    throw new Error(
      'SseManager not initialized — call initializeEvents() first'
    )
  }
  return sseManager
}
