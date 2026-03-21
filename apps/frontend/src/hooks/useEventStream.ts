import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import {
  NOTIFICATIONS_QUERY_KEY,
  UNREAD_COUNT_QUERY_KEY,
} from '@/hooks/useNotifications'
import logger from '@/utils/logger'

const RECONNECT_DELAY = 5000
const SSE_URL = '/api/sse/stream'

export function useEventStream() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      const es = new EventSource(SSE_URL, { withCredentials: true })
      eventSourceRef.current = es

      es.onopen = () => {
        logger.info('[SSE] Connected')
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
        logger.warn('[SSE] Connection lost, reconnecting...')
        es.close()
        eventSourceRef.current = null

        reconnectTimerRef.current = setTimeout(() => {
          connect()
        }, RECONNECT_DELAY)
      }
    }

    connect()

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [isAuthenticated, queryClient])
}
