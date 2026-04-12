import { api } from './api'
import type { ComplianceReport } from '@/types'

export const complianceApi = {
  getCompliance: (coproprieteId: number) =>
    api.get<{ data: ComplianceReport }>(
      `/coproprietes/${coproprieteId}/compliance`
    ),
}
