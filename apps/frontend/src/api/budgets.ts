import { api } from './api'
import type { BudgetPrevisionnel, PosteDepense, ApiResponse } from '@/types'

export const budgetsApi = {
  getAllByCopropriete: (coproprieteId: number) =>
    api.get<{ data: BudgetPrevisionnel[] }>(`/budgets/copropriete/${coproprieteId}`),

  getById: (id: number) =>
    api.get<{ data: BudgetPrevisionnel }>(`/budgets/${id}`),

  create: (data: Partial<BudgetPrevisionnel>) =>
    api.post<ApiResponse<BudgetPrevisionnel>>('/budgets', data),

  update: (id: number, data: Partial<BudgetPrevisionnel>) =>
    api.put<ApiResponse<BudgetPrevisionnel>>(`/budgets/${id}`, data),

  delete: (id: number) =>
    api.delete<{ message: string }>(`/budgets/${id}`),

  getPostes: (budgetId: number) =>
    api.get<{ data: PosteDepense[] }>(`/budgets/${budgetId}/postes`),

  createPoste: (data: Partial<PosteDepense>) =>
    api.post<ApiResponse<PosteDepense>>('/budgets/postes', data),

  updatePoste: (id: number, data: Partial<PosteDepense>) =>
    api.put<ApiResponse<PosteDepense>>(`/budgets/postes/${id}`, data),

  deletePoste: (id: number) =>
    api.delete<{ message: string }>(`/budgets/postes/${id}`),
}
