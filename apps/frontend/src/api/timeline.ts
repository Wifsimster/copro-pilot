import { api } from './api'
import type { DomainEvent } from '@/types'

export const timelineApi = {
  getByEntity: (entityType: string, entityId: number) =>
    api.get<{ data: DomainEvent[] }>(
      `/timeline/${entityType}/${entityId}`
    ),
}
