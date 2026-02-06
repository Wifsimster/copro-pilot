import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsApi } from '@/api/budgets'
import type { BudgetPrevisionnel, PosteDepense } from '@/types'

export const BUDGETS_QUERY_KEY = ['budgets'] as const

export function useBudgetsByCopropriete(coproprieteId: number | undefined) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, 'copropriete', coproprieteId],
    queryFn: async () => {
      const response = await budgetsApi.getAllByCopropriete(coproprieteId!)
      return response.data
    },
    enabled: !!coproprieteId,
  })
}

export function useBudget(id: number | undefined) {
  return useQuery({
    queryKey: [...BUDGETS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await budgetsApi.getById(id!)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<BudgetPrevisionnel>) => budgetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })
}

export function useUpdateBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BudgetPrevisionnel> }) =>
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })
}

export function useCreatePoste() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PosteDepense>) => budgetsApi.createPoste(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })
}

export function useDeletePoste() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => budgetsApi.deletePoste(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
    },
  })
}
