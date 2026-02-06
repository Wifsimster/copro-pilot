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
import type { Intervention } from '@/types'

const interventionSchema = z.object({
  description: z.string().min(1, 'La description est obligatoire'),
  prestataire: z.string().optional(),
  montant_devis: z.coerce.number().positive().optional().or(z.literal('')),
  date_prevue: z.string().optional(),
})

type InterventionFormData = z.infer<typeof interventionSchema>

interface InterventionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Intervention>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Intervention>
  title?: string
}

export function InterventionFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle intervention',
}: InterventionFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      description: defaultValues?.description || '',
      prestataire: defaultValues?.prestataire || '',
      montant_devis: defaultValues?.montant_devis ?? '',
      date_prevue: defaultValues?.date_prevue || '',
    },
  })

  const handleFormSubmit = async (data: InterventionFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      prestataire: data.prestataire || null,
      montant_devis: data.montant_devis === '' ? null : Number(data.montant_devis),
      date_prevue: data.date_prevue || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="description">Description *</Label>
            <Input id="description" {...register('description')} placeholder="Reparation de la fuite..." />
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="prestataire">Prestataire</Label>
            <Input id="prestataire" {...register('prestataire')} placeholder="Nom du prestataire..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="montant_devis">Montant devis (EUR)</Label>
              <Input id="montant_devis" type="number" step="0.01" {...register('montant_devis')} placeholder="1500" />
            </div>
            <div>
              <Label htmlFor="date_prevue">Date prevue</Label>
              <Input id="date_prevue" type="date" {...register('date_prevue')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
