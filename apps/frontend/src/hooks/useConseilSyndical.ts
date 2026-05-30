import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { conseilSyndicalApi } from '@/api/conseil-syndical'
import type { MembreConseilSyndical } from '@/types'

const CONSEIL_SYNDICAL_QUERY_KEY = ['conseil-syndical'] as const

export function useConseilSyndicalByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...CONSEIL_SYNDICAL_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await conseilSyndicalApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateMembreConseil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<MembreConseilSyndical>) => conseilSyndicalApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSEIL_SYNDICAL_QUERY_KEY })
    },
  })
}

export function useUpdateMembreConseil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MembreConseilSyndical> }) =>
      conseilSyndicalApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSEIL_SYNDICAL_QUERY_KEY })
    },
  })
}

export function useDeleteMembreConseil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => conseilSyndicalApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONSEIL_SYNDICAL_QUERY_KEY })
    },
  })
}
