import { useState } from 'react'
import { useRequestErasure } from '@/hooks/useGdpr'
import { useAuthStore } from '@/store/authStore'
import { gdprApi } from '@/api/gdpr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AlertTriangle, Download, Trash2 } from 'lucide-react'

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const erasure = useRequestErasure()
  const logout = useAuthStore(state => state.logout)

  const handleDelete = async () => {
    setError('')
    try {
      await erasure.mutateAsync(confirmation)
      setOpen(false)
      await logout()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue'
      )
    }
  }

  const isValid = confirmation === 'SUPPRIMER MON COMPTE'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer mon compte
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Suppression du compte
          </DialogTitle>
          <DialogDescription className="space-y-2 text-left">
            <p>
              Cette action est <strong>irreversible</strong>.
              Votre compte sera supprime et vos donnees
              personnelles seront anonymisees.
            </p>
            <p>
              Conformement a la legislation francaise, vos
              donnees financieres (paiements, charges) seront
              conservees de maniere anonyme pendant la duree
              legale de 10 ans.
            </p>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => gdprApi.exportMyData()}
          >
            <Download className="mr-2 h-4 w-4" />
            Telecharger mes donnees avant suppression
          </Button>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete">
              Tapez{' '}
              <span className="font-mono font-bold">
                SUPPRIMER MON COMPTE
              </span>{' '}
              pour confirmer :
            </Label>
            <Input
              id="confirm-delete"
              value={confirmation}
              onChange={e => setConfirmation(e.target.value)}
              placeholder="SUPPRIMER MON COMPTE"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isValid || erasure.isPending}
          >
            {erasure.isPending
              ? 'Suppression...'
              : 'Confirmer la suppression'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
