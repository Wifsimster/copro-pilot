import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_COUNT_QUERY_KEY,
} from '@/hooks/useNotifications'
import logger from '@/utils/logger'

const RECONNECT_DELAY = 5000
const MAX_FAILURES_BEFORE_OPEN = 3
const SSE_URL = '/api/sse/stream'

export function useEventStream() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) return

    // The connection and reconnect timer live entirely within this effect, so
    // they are kept in closure variables the cleanup can safely read.
    let eventSource: EventSource | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    // EventSource does not expose HTTP status codes, so a stream rejected by
    // the server (401, or 403 plan gating — SSE requires the plan Pro) is
    // indistinguishable from a network blip. Streams that fail repeatedly
    // without ever opening are treated as refused and stop reconnecting.
    let failuresBeforeOpen = 0

    function connect() {
      if (eventSource) {
        eventSource.close()
      }

      const es = new EventSource(SSE_URL, { withCredentials: true })
      eventSource = es
      let opened = false

      es.onopen = () => {
        logger.info('[SSE] Connected')
        opened = true
        failuresBeforeOpen = 0
        // Invalidate notifications on reconnect to catch up
        queryClient.invalidateQueries({
          queryKey: NOTIFICATIONS_QUERY_KEY,
        })
        queryClient.invalidateQueries({
          queryKey: UNREAD_COUNT_QUERY_KEY,
        })
      }

      es.onmessage = event => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'refresh_notifications') {
            queryClient.invalidateQueries({
              queryKey: NOTIFICATIONS_QUERY_KEY,
            })
            queryClient.invalidateQueries({
              queryKey: UNREAD_COUNT_QUERY_KEY,
            })
          }
        } catch (err) {
          logger.error('[SSE] Failed to parse event', err)
        }
      }

      es.onerror = () => {
        es.close()
        eventSource = null

        if (!opened) {
          failuresBeforeOpen += 1
          if (failuresBeforeOpen >= MAX_FAILURES_BEFORE_OPEN) {
            logger.warn(
              '[SSE] Stream refused by server (plan gating or auth), giving up'
            )
            return
          }
        }

        logger.warn('[SSE] Connection lost, reconnecting...')
        reconnectTimer = setTimeout(() => {
          connect()
        }, RECONNECT_DELAY)
      }
    }

    connect()

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      if (eventSource) {
        eventSource.close()
        eventSource = null
      }
    }
  }, [isAuthenticated, queryClient])
}
