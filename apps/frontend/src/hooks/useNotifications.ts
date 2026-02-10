import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/api/notifications'

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const
export const UNREAD_COUNT_QUERY_KEY = ['notifications', 'unread-count'] as const

export function useNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await notificationsApi.getAll()
      return response.data
    },
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount()
      return response.data.count
    },
    refetchInterval: 30000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY })
    },
  })
}
