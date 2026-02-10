import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wrench, Banknote } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Intervention } from '@/types'

const interventionSchema = z.object({
  description: z.string().min(1, 'La description est obligatoire'),
  prestataire: z.string().optional(),
  statut: z.enum(['en_attente', 'planifiee', 'en_cours', 'terminee', 'annulee']),
  montant_devis: z.coerce.number().positive().optional().or(z.literal('')),
  montant_facture: z.coerce.number().positive().optional().or(z.literal('')),
  date_prevue: z.string().optional(),
  date_realisation: z.string().optional(),
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      description: defaultValues?.description || '',
      prestataire: defaultValues?.prestataire || '',
      statut: defaultValues?.statut || 'en_attente',
      montant_devis: defaultValues?.montant_devis ?? '',
      montant_facture: defaultValues?.montant_facture ?? '',
      date_prevue: defaultValues?.date_prevue || '',
      date_realisation: defaultValues?.date_realisation || '',
    },
  })

  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: InterventionFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      prestataire: data.prestataire || null,
      montant_devis: data.montant_devis === '' ? null : Number(data.montant_devis),
      montant_facture: data.montant_facture === '' ? null : Number(data.montant_facture),
      date_prevue: data.date_prevue || null,
      date_realisation: data.date_realisation || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Planifiez une intervention. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Intervention details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wrench className="size-4" />
              <span>Intervention</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea {...register('description')} rows={3} placeholder="Reparation de la fuite..." />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prestataire">Prestataire</Label>
                <Input id="prestataire" {...register('prestataire')} placeholder="Nom du prestataire..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as InterventionFormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="planifiee">Planifiee</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminee</SelectItem>
                    <SelectItem value="annulee">Annulee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cost & date section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Banknote className="size-4" />
              <span>Devis, facture et planning</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant_devis">Montant devis (EUR)</Label>
                <Input id="montant_devis" type="number" step="0.01" {...register('montant_devis')} placeholder="1500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant_facture">Montant facture (EUR)</Label>
                <Input id="montant_facture" type="number" step="0.01" {...register('montant_facture')} placeholder="1500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_prevue">Date prevue</Label>
                <Input id="date_prevue" type="date" {...register('date_prevue')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_realisation">Date realisation</Label>
                <Input id="date_realisation" type="date" {...register('date_realisation')} />
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
