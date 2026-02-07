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
import type { CarnetEntretien } from '@/types'

const schema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  prestataire: z.string().optional(),
  montant: z.coerce.number().positive().optional().or(z.literal('')),
  date_realisation: z.string().min(1, 'La date est obligatoire'),
  categorie: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<CarnetEntretien>) => Promise<void>
  isLoading?: boolean
}

export function CarnetEntretienFormDialog({ open, onOpenChange, coproprieteId, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titre: '',
      description: '',
      prestataire: '',
      montant: '',
      date_realisation: new Date().toISOString().split('T')[0],
      categorie: '',
    },
  })

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      description: data.description || null,
      prestataire: data.prestataire || null,
      montant: data.montant === '' ? null : Number(data.montant),
      categorie: data.categorie || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle entree au carnet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titre">Titre *</Label>
            <Input id="titre" {...register('titre')} placeholder="Ravalement facade..." />
            {errors.titre && <p className="mt-1 text-sm text-red-500">{errors.titre.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prestataire">Prestataire</Label>
              <Input id="prestataire" {...register('prestataire')} />
            </div>
            <div>
              <Label htmlFor="categorie">Categorie</Label>
              <Input id="categorie" {...register('categorie')} placeholder="Toiture, Plomberie..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="montant">Montant (EUR)</Label>
              <Input id="montant" type="number" step="0.01" {...register('montant')} />
            </div>
            <div>
              <Label htmlFor="date_realisation">Date de realisation *</Label>
              <Input id="date_realisation" type="date" {...register('date_realisation')} />
              {errors.date_realisation && <p className="mt-1 text-sm text-red-500">{errors.date_realisation.message}</p>}
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
