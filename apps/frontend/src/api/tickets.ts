import { api } from './api'
import type { Ticket, TicketMessage, ApiResponse } from '@/types'

export const ticketsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: Ticket[] }>('/tickets', { copropriete_id: coproprieteId }),

  getAllByUser: (userId: string) =>
    api.get<{ data: Ticket[] }>('/tickets', { user_id: userId }),

  getById: (id: number) =>
    api.get<{ data: Ticket & { messages: TicketMessage[] } }>(`/tickets/${id}`),

  create: (data: Partial<Ticket>) =>
    api.post<ApiResponse<Ticket>>('/tickets', data),

  update: (id: number, data: Partial<Ticket>) =>
    api.put<ApiResponse<Ticket>>(`/tickets/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/tickets/${id}`),

  addMessage: (ticketId: number, data: { contenu: string; auteur_id?: string }) =>
    api.post<ApiResponse<TicketMessage>>(`/tickets/${ticketId}/messages`, data),
}
