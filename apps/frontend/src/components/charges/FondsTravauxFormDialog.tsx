import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PiggyBank } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { FondsTravaux } from '@/types'

const schema = z.object({
  annee: z.coerce.number().min(2000).max(2100),
  cotisation_annuelle: z.coerce.number().min(0),
  solde: z.coerce.number(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<FondsTravaux>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<FondsTravaux>
  title?: string
}

export function FondsTravauxFormDialog({ open, onOpenChange, coproprieteId, onSubmit, isLoading, defaultValues, title = 'Nouveau fonds travaux' }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      annee: defaultValues?.annee || new Date().getFullYear(),
      cotisation_annuelle: defaultValues?.cotisation_annuelle || 0,
      solde: defaultValues?.solde || 0,
    },
  })

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({ ...data, copropriete_id: coproprieteId })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Definissez le fonds travaux annuel. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <PiggyBank className="size-4" />
              <span>Fonds travaux</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annee">Annee *</Label>
                <Input id="annee" type="number" {...register('annee')} />
                {errors.annee && (
                  <p className="text-sm text-destructive">{errors.annee.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cotisation_annuelle">Cotisation annuelle (EUR) *</Label>
                <Input id="cotisation_annuelle" type="number" step="0.01" {...register('cotisation_annuelle')} />
                {errors.cotisation_annuelle && (
                  <p className="text-sm text-destructive">{errors.cotisation_annuelle.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="solde">Solde (EUR) *</Label>
                <Input id="solde" type="number" step="0.01" {...register('solde')} />
                {errors.solde && (
                  <p className="text-sm text-destructive">{errors.solde.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
