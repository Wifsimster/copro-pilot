import { useState } from 'react'
import { KeyRound, CheckCircle, XCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ResetPasswordDialog } from './ResetPasswordDialog'
import type { CoproprietaireUser } from '@/api/userManagement'

interface UserManagementTableProps {
  users: CoproprietaireUser[]
  onResetPassword: (userId: string) => Promise<void>
}

export function UserManagementTable({
  users,
  onResetPassword,
}: UserManagementTableProps) {
  const [search, setSearch] = useState('')
  const [resetTarget, setResetTarget] =
    useState<CoproprietaireUser | null>(null)

  const filtered = users.filter(
    u =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">
                Nom
              </th>
              <th className="text-left p-3 font-medium">
                Email
              </th>
              <th className="text-left p-3 font-medium">
                Email vérifié
              </th>
              <th className="text-left p-3 font-medium">
                Copropriétés
              </th>
              <th className="text-right p-3 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-8 text-muted-foreground"
                >
                  Aucun utilisateur copropriétaire trouvé
                </td>
              </tr>
            ) : (
              filtered.map(user => (
                <tr
                  key={user.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="p-3 font-medium">
                    {user.name || '—'}
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="p-3">
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="size-3.5" />
                        Vérifié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                        <XCircle className="size-3.5" />
                        Non vérifié
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {user.coproprietes?.map(c => (
                        <span
                          key={c.id}
                          className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {c.nom}
                        </span>
                      ))}
                      {(!user.coproprietes ||
                        user.coproprietes.length === 0) && (
                        <span className="text-xs text-muted-foreground">
                          -
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetTarget(user)}
                    >
                      <KeyRound className="size-3.5" />
                      Réinitialiser MDP
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {resetTarget && (
        <ResetPasswordDialog
          userName={resetTarget.name || resetTarget.email}
          userEmail={resetTarget.email}
          isOpen={!!resetTarget}
          onClose={() => setResetTarget(null)}
          onConfirm={() => onResetPassword(resetTarget.id)}
        />
      )}
    </>
  )
}
