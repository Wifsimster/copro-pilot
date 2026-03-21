import logger from '../../logger.js'

export function registerSseHandlers(eventBus, sseManager) {
  eventBus.onAny(event => {
    try {
      sseManager.broadcastAll({
        type: 'refresh_notifications',
        event_type: event.event_type,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      logger.error('[SseHandler] Error broadcasting event', {
        eventType: event.event_type,
        error: err.message,
      })
    }
  })

  logger.info('[SseHandler] SSE handlers registered')
}
