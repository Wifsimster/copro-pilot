import { useState } from 'react'
import {
  Loader2,
  Users,
  Link2,
  AlertCircle,
  Check,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useBulkCreationPreview,
  useBulkCreateUsers,
} from '@/hooks/useUserManagement'
import type { BulkCreationResults } from '@/api/userManagement'

interface BulkCreateAccountsDialogProps {
  coproprieteId: number
  isOpen: boolean
  onClose: () => void
}

export function BulkCreateAccountsDialog({
  coproprieteId,
  isOpen,
  onClose,
}: BulkCreateAccountsDialogProps) {
  const { data: preview, isLoading: previewLoading } =
    useBulkCreationPreview(isOpen ? coproprieteId : null)
  const bulkCreate = useBulkCreateUsers()
  const [results, setResults] =
    useState<BulkCreationResults | null>(null)

  if (!isOpen) return null

  const handleCreate = async () => {
    try {
      const res =
        await bulkCreate.mutateAsync(coproprieteId)
      setResults(res.data)
    } catch {
      // Error handled by mutation
    }
  }

  const handleClose = () => {
    setResults(null)
    onClose()
  }

  const totalActions =
    (preview?.toCreate?.length || 0) +
    (preview?.toLink?.length || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl border bg-card p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserPlus className="size-5" />
          </div>
          <h3 className="text-lg font-semibold">
            Créer les comptes extranet
          </h3>
        </div>

        {previewLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : results ? (
          // Results view
          <div className="space-y-4">
            {results.created.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Check className="size-4 text-green-600" />
                  Comptes créés ({results.created.length})
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {results.created.map(c => (
                    <li key={c.email}>
                      {c.email} — email d&apos;activation
                      envoyé
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.linked.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Link2 className="size-4 text-blue-600" />
                  Comptes existants liés (
                  {results.linked.length})
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {results.linked.map(l => (
                    <li key={l.email}>
                      {l.email} — lié automatiquement
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.errors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2 text-destructive">
                  <AlertCircle className="size-4" />
                  Erreurs ({results.errors.length})
                </h4>
                <ul className="text-sm text-destructive space-y-1">
                  {results.errors.map((err, i) => (
                    <li key={i}>
                      {err.email} — {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </div>
        ) : (
          // Preview view
          <div className="space-y-4">
            {totalActions === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Tous les copropriétaires ont déjà un compte
                ou n&apos;ont pas d&apos;adresse email
                renseignée.
              </p>
            ) : (
              <>
                {preview?.toCreate &&
                  preview.toCreate.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Users className="size-4 text-primary" />
                        Comptes à créer (
                        {preview.toCreate.length})
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                        {preview.toCreate.map(c => (
                          <li key={c.coproprietaireId}>
                            {c.prenom} {c.nom} — {c.email}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {preview?.toLink &&
                  preview.toLink.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Link2 className="size-4 text-blue-600" />
                        Comptes existants à lier (
                        {preview.toLink.length})
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                        {preview.toLink.map(l => (
                          <li key={l.coproprietaireId}>
                            {l.prenom} {l.nom} — {l.email}{' '}
                            (compte existant)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {preview?.noEmail &&
                  preview.noEmail.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {preview.noEmail.length}{' '}
                      copropriétaire(s) sans email
                      (ignoré(s))
                    </p>
                  )}
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Annuler
              </Button>
              {totalActions > 0 && (
                <Button
                  onClick={handleCreate}
                  disabled={bulkCreate.isPending}
                >
                  {bulkCreate.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    `Créer ${totalActions} compte(s)`
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
