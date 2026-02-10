import { api } from './api'
import type { Notification } from '@/types'

export const notificationsApi = {
  getAll: () =>
    api.get<{ data: Notification[] }>('/notifications'),

  getUnreadCount: () =>
    api.get<{ data: { count: number } }>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    api.put<{ data: Notification; message: string }>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<{ message: string }>('/notifications/read-all'),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/notifications/${id}`),
}
