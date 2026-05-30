import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/api/tickets'
import type { Ticket } from '@/types'

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export const TICKETS_QUERY_KEY = ['tickets'] as const

export function useTicketsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...TICKETS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await ticketsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useTicketsByUser(userId: string | undefined) {
  return useQuery({
    queryKey: [...TICKETS_QUERY_KEY, 'user', userId],
    queryFn: async () => {
      const response = await ticketsApi.getAllByUser(userId!)
      return response.data
    },
    enabled: !!userId,
  })
}

export function useTicket(id: number | undefined) {
  return useQuery({
    queryKey: [...TICKETS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await ticketsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Ticket>) => ticketsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY })
    },
  })
}

export function useUpdateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Ticket> }) =>
      ticketsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY })
    },
  })
}

export function useDeleteTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ticketsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY })
    },
  })
}

export function useAddTicketMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      ticketId,
      data,
    }: {
      ticketId: number
      data: { contenu: string; auteur_id?: string }
    }) => ticketsApi.addMessage(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY })
    },
  })
}
