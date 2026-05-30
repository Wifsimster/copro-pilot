import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userManagementApi } from '@/api/userManagement'

export function useCoproprietaireUsers() {
  return useQuery({
    queryKey: ['user-management', 'coproprietaires'],
    queryFn: () => userManagementApi.listCoproprietaireUsers(),
    select: data => data.data,
  })
}

export function useResetUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) =>
      userManagementApi.triggerPasswordReset(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-management'],
      })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useSetUserPassword() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- password reset does not change any cached query
  return useMutation({
    mutationFn: ({
      userId,
      newPassword,
    }: {
      userId: string
      newPassword: string
    }) =>
      userManagementApi.setPasswordDirectly(
        userId,
        newPassword
      ),
  })
}

export function useBulkCreationPreview(
  coproprieteId: number | null
) {
  return useQuery({
    queryKey: [
      'user-management',
      'bulk-preview',
      coproprieteId,
    ],
    queryFn: () =>
      userManagementApi.getBulkCreationPreview(
        coproprieteId!
      ),
    select: data => data.data,
    enabled: !!coproprieteId,
  })
}

export function useBulkCreateUsers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (coproprieteId: number) =>
      userManagementApi.bulkCreateUsers(coproprieteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['user-management'],
      })
    },
  })
}

// react-doctor-disable-next-line deslop/unused-export -- consumed via re-export/named-import that react-doctor does not trace
export function useSetInitialPassword() {
  // react-doctor-disable-next-line react-doctor/query-mutation-missing-invalidation -- password change does not change any cached query
  return useMutation({
    mutationFn: (newPassword: string) =>
      userManagementApi.setInitialPassword(newPassword),
  })
}
