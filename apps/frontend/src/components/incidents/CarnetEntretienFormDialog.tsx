import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardList, Banknote } from 'lucide-react'
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
  defaultValues?: Partial<CarnetEntretien>
  title?: string
}

export function CarnetEntretienFormDialog({ open, onOpenChange, coproprieteId, onSubmit, isLoading, defaultValues, title = 'Nouvelle entree au carnet' }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      titre: defaultValues?.titre || '',
      description: defaultValues?.description || '',
      prestataire: defaultValues?.prestataire || '',
      montant: defaultValues?.montant ?? '',
      date_realisation: defaultValues?.date_realisation || new Date().toISOString().split('T')[0],
      categorie: defaultValues?.categorie || '',
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Ajoutez une entree au carnet d'entretien. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Entry details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ClipboardList className="size-4" />
              <span>Entretien</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input id="titre" {...register('titre')} placeholder="Ravalement facade..." />
              {errors.titre && (
                <p className="text-sm text-destructive">{errors.titre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="Details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prestataire">Prestataire</Label>
                <Input id="prestataire" {...register('prestataire')} placeholder="Nom du prestataire" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorie">Categorie</Label>
                <Input id="categorie" {...register('categorie')} placeholder="Toiture, Plomberie..." />
              </div>
            </div>
          </div>

          <Separator />

          {/* Cost & date section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Banknote className="size-4" />
              <span>Cout et date</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (EUR)</Label>
                <Input id="montant" type="number" step="0.01" {...register('montant')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_realisation">Date de realisation *</Label>
                <Input id="date_realisation" type="date" {...register('date_realisation')} />
                {errors.date_realisation && (
                  <p className="text-sm text-destructive">{errors.date_realisation.message}</p>
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
