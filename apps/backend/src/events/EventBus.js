export class EventBus {
  constructor({ eventStore, logger }) {
    this.eventStore = eventStore
    this.logger = logger
    this.handlers = new Map()
    this.anyHandlers = []
  }

  on(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    this.handlers.get(eventType).push(handler)
  }

  onAny(handler) {
    this.anyHandlers.push(handler)
  }

  off(eventType, handler) {
    const list = this.handlers.get(eventType)
    if (!list) return
    const idx = list.indexOf(handler)
    if (idx !== -1) list.splice(idx, 1)
  }

  offAny(handler) {
    const idx = this.anyHandlers.indexOf(handler)
    if (idx !== -1) this.anyHandlers.splice(idx, 1)
  }

  async emit(eventType, {
    entityType,
    entityId,
    coproprieteId,
    actorId,
    payload = {},
    metadata = {},
  }) {
    // Persist to DB first
    const event = await this.eventStore.create({
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId,
      copropriete_id: coproprieteId,
      actor_id: actorId,
      payload,
      metadata,
    })

    this.logger.info(
      `[EventBus] Event persisted: ${eventType} (${event.id})`
    )

    // Dispatch to typed handlers
    const list = this.handlers.get(eventType) || []
    for (const handler of list) {
      try {
        await handler(event)
      } catch (error) {
        this.logger.error(
          `[EventBus] Handler error for ${eventType}: ${error.message}`,
          { eventId: event.id, stack: error.stack }
        )
      }
    }

    // Dispatch to wildcard handlers
    for (const handler of this.anyHandlers) {
      try {
        await handler(event)
      } catch (error) {
        this.logger.error(
          `[EventBus] Any-handler error for ${eventType}: ${error.message}`,
          { eventId: event.id, stack: error.stack }
        )
      }
    }

    return event
  }
}
