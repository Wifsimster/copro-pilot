import { useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResetPasswordDialogProps {
  userName: string
  userEmail: string
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function ResetPasswordDialog({
  userName,
  userEmail,
  isOpen,
  onClose,
  onConfirm,
}: ResetPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<
    'idle' | 'success' | 'error'
  >('idle')

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      setResult('success')
    } catch {
      setResult('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setResult('idle')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-lg space-y-4">
        {result === 'success' ? (
          <>
            <h3 className="text-lg font-semibold">
              Email envoyé
            </h3>
            <p className="text-sm text-muted-foreground">
              Un email de réinitialisation a été envoyé à{' '}
              <strong>{userEmail}</strong>.
            </p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Fermer</Button>
            </div>
          </>
        ) : result === 'error' ? (
          <>
            <h3 className="text-lg font-semibold text-destructive">
              Erreur
            </h3>
            <p className="text-sm text-muted-foreground">
              Impossible d&apos;envoyer l&apos;email de
              réinitialisation. Veuillez réessayer.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>
                Fermer
              </Button>
              <Button
                onClick={() => {
                  setResult('idle')
                }}
              >
                Réessayer
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Réinitialiser le mot de passe
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Un email de réinitialisation sera envoyé à{' '}
                  <strong>{userName}</strong> ({userEmail}).
                  L&apos;utilisateur devra créer un nouveau mot
                  de passe.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  'Envoyer le lien'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
