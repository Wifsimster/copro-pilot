import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { reconciliationApi } from '@/api/reconciliation'

export const RECONCILIATION_QUERY_KEY =
  ['reconciliation'] as const

export function useSuggestedMatches(
  compteBancaireId: number | undefined
) {
  return useQuery({
    queryKey: [
      ...RECONCILIATION_QUERY_KEY,
      'suggestions',
      compteBancaireId,
    ],
    queryFn: async () => {
      const response =
        await reconciliationApi.getSuggestedMatches(
          compteBancaireId!
        )
      return response.data
    },
    enabled: !!compteBancaireId,
  })
}

export function useConfirmMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      mouvementId,
      appelFondsId,
    }: {
      mouvementId: number
      appelFondsId: number
    }) =>
      reconciliationApi.confirmMatch(
        mouvementId,
        appelFondsId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: RECONCILIATION_QUERY_KEY,
      })
    },
  })
}
