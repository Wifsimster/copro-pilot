import { api } from './api'
import type { CashFlowForecast } from '@/types'

export const cashFlowApi = {
  getForecast: (coproprieteId: number) =>
    api.get<{ data: CashFlowForecast }>(
      `/cash-flow/copropriete/${coproprieteId}`
    ),
}
