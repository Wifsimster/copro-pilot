import { api } from './api'
import type {
  RegularisationBudgetResponse,
  RegularisationAppelsResponse,
} from '@/types'

export const regularisationApi = {
  generateBudgetFromAg: (agId: number) =>
    api.post<RegularisationBudgetResponse>(
      '/regularisation/budget-from-ag',
      { agId }
    ),

  generateAppelsFromBudget: (
    budgetId: number,
    coproprieteId: number
  ) =>
    api.post<RegularisationAppelsResponse>(
      '/regularisation/appels-from-budget',
      { budgetId, coproprieteId }
    ),
}
