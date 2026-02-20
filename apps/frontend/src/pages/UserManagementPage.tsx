import { Users, Loader2 } from 'lucide-react'
import {
  useCoproprietaireUsers,
  useResetUserPassword,
} from '@/hooks/useUserManagement'
import { UserManagementTable } from '@/components/user-management/UserManagementTable'

export default function UserManagementPage() {
  const { data: users, isLoading, error } = useCoproprietaireUsers()
  const resetPasswordMutation = useResetUserPassword()

  const handleResetPassword = async (userId: string) => {
    await resetPasswordMutation.mutateAsync(userId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Gestion des utilisateurs
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez les comptes extranet des copropriétaires
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Erreur lors du chargement des utilisateurs :{' '}
          {error instanceof Error
            ? error.message
            : 'Erreur inconnue'}
        </div>
      ) : (
        <UserManagementTable
          users={users || []}
          onResetPassword={handleResetPassword}
        />
      )}
    </div>
  )
}
