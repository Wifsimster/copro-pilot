import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
}

export function FondsTravauxFormDialog({ open, onOpenChange, coproprieteId, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { annee: new Date().getFullYear(), cotisation_annuelle: 0, solde: 0 },
  })

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({ ...data, copropriete_id: coproprieteId })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau fonds travaux</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="annee">Annee *</Label>
            <Input id="annee" type="number" {...register('annee')} />
            {errors.annee && <p className="mt-1 text-sm text-red-500">{errors.annee.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cotisation_annuelle">Cotisation annuelle (EUR) *</Label>
              <Input id="cotisation_annuelle" type="number" step="0.01" {...register('cotisation_annuelle')} />
              {errors.cotisation_annuelle && <p className="mt-1 text-sm text-red-500">{errors.cotisation_annuelle.message}</p>}
            </div>
            <div>
              <Label htmlFor="solde">Solde (EUR) *</Label>
              <Input id="solde" type="number" step="0.01" {...register('solde')} />
              {errors.solde && <p className="mt-1 text-sm text-red-500">{errors.solde.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700">Annuler</button>
            <button type="submit" disabled={isLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">{isLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
