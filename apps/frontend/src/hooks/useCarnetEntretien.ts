import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carnetEntretienApi } from '@/api/carnet-entretien'
import type { CarnetEntretien } from '@/types'

export const CARNET_ENTRETIEN_QUERY_KEY = ['carnet-entretien'] as const

export function useCarnetEntretienByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...CARNET_ENTRETIEN_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await carnetEntretienApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useCreateCarnetEntretien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CarnetEntretien>) => carnetEntretienApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARNET_ENTRETIEN_QUERY_KEY })
    },
  })
}

export function useUpdateCarnetEntretien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CarnetEntretien> }) => carnetEntretienApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARNET_ENTRETIEN_QUERY_KEY })
    },
  })
}

export function useDeleteCarnetEntretien() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => carnetEntretienApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CARNET_ENTRETIEN_QUERY_KEY })
    },
  })
}
