import { useMutation, useQueryClient } from '@tanstack/react-query'
import { regularisationApi } from '@/api/regularisation'
import { BUDGETS_QUERY_KEY } from './useBudgets'

export function useGenerateBudgetFromAg() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (agId: number) =>
      regularisationApi.generateBudgetFromAg(agId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BUDGETS_QUERY_KEY,
      })
    },
  })
}

export function useGenerateAppelsFromBudget() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      budgetId,
      coproprieteId,
    }: {
      budgetId: number
      coproprieteId: number
    }) =>
      regularisationApi.generateAppelsFromBudget(
        budgetId,
        coproprieteId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: BUDGETS_QUERY_KEY,
      })
    },
  })
}
