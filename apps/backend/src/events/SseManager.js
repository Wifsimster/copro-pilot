import logger from '../logger.js'

class SseManager {
  constructor() {
    this.clients = new Map()
    this.heartbeatInterval = null
    this._startHeartbeat()
  }

  addClient(userId, res) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set())
    }
    this.clients.get(userId).add(res)

    res.on('close', () => {
      this.removeClient(userId, res)
    })

    logger.info('[SSE] Client connected', {
      userId,
      totalConnections: this.getConnectionCount(),
    })
  }

  removeClient(userId, res) {
    const connections = this.clients.get(userId)
    if (!connections) return

    connections.delete(res)
    if (connections.size === 0) {
      this.clients.delete(userId)
    }

    logger.info('[SSE] Client disconnected', {
      userId,
      totalConnections: this.getConnectionCount(),
    })
  }

  broadcast(userIds, eventData) {
    const payload = `data: ${JSON.stringify(eventData)}\n\n`
    for (const userId of userIds) {
      const connections = this.clients.get(userId)
      if (!connections) continue
      for (const res of connections) {
        try {
          res.write(payload)
        } catch (err) {
          logger.error('[SSE] Error writing to client', {
            userId,
            error: err.message,
          })
          this.removeClient(userId, res)
        }
      }
    }
  }

  broadcastAll(eventData) {
    const payload = `data: ${JSON.stringify(eventData)}\n\n`
    for (const [userId, connections] of this.clients) {
      for (const res of connections) {
        try {
          res.write(payload)
        } catch (err) {
          logger.error('[SSE] Error writing to client', {
            userId,
            error: err.message,
          })
          this.removeClient(userId, res)
        }
      }
    }
  }

  getConnectionCount() {
    let count = 0
    for (const connections of this.clients.values()) {
      count += connections.size
    }
    return count
  }

  _startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      for (const [userId, connections] of this.clients) {
        for (const res of connections) {
          try {
            res.write(': keepalive\n\n')
          } catch (err) {
            logger.error('[SSE] Heartbeat error', {
              userId,
              error: err.message,
            })
            this.removeClient(userId, res)
          }
        }
      }
    }, 30000)
  }

  destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    this.clients.clear()
  }
}

export default SseManager
