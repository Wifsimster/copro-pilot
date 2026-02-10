import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileSignature, CalendarDays, Euro, FileText } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ContratSyndic } from '@/types'

const contratSyndicSchema = z.object({
  syndic_nom: z.string().min(1, 'Le nom du syndic est obligatoire'),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().min(1, 'La date de fin est obligatoire'),
  remuneration_forfait: z.coerce.number().optional(),
  prestations_incluses: z.string().optional(),
  prestations_particulieres: z.string().optional(),
  conditions_execution: z.string().optional(),
  statut: z.enum(['en_cours', 'expire', 'resilie', 'en_attente']),
  ag_designation_id: z.coerce.number().optional(),
  notes: z.string().optional(),
})

type ContratSyndicFormData = z.infer<typeof contratSyndicSchema>

interface ContratSyndicFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<ContratSyndic>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ContratSyndic>
  title?: string
}

export function ContratSyndicFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau contrat de syndic',
}: ContratSyndicFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContratSyndicFormData>({
    resolver: zodResolver(contratSyndicSchema),
    defaultValues: {
      syndic_nom: defaultValues?.syndic_nom || '',
      date_debut: defaultValues?.date_debut || new Date().toISOString().slice(0, 10),
      date_fin: defaultValues?.date_fin || '',
      remuneration_forfait: defaultValues?.remuneration_forfait || 0,
      prestations_incluses: defaultValues?.prestations_incluses || '',
      prestations_particulieres: defaultValues?.prestations_particulieres || '',
      conditions_execution: defaultValues?.conditions_execution || '',
      statut: defaultValues?.statut || 'en_cours',
      ag_designation_id: defaultValues?.ag_designation_id || 0,
      notes: defaultValues?.notes || '',
    },
  })

  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: ContratSyndicFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      remuneration_forfait: data.remuneration_forfait || null,
      prestations_incluses: data.prestations_incluses || null,
      prestations_particulieres: data.prestations_particulieres || null,
      conditions_execution: data.conditions_execution || null,
      ag_designation_id: data.ag_designation_id || null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Definissez les informations du contrat de syndic. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Syndic section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileSignature className="size-4" />
              <span>Syndic</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="syndic_nom">Nom du syndic *</Label>
              <Input id="syndic_nom" {...register('syndic_nom')} placeholder="Nom du cabinet de syndic" />
              {errors.syndic_nom && (
                <p className="text-sm text-destructive">{errors.syndic_nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut *</Label>
              <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as ContratSyndicFormData['statut'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="expire">Expire</SelectItem>
                  <SelectItem value="resilie">Resilie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Dates section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Duree du mandat</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_debut">Date de debut *</Label>
                <Input id="date_debut" type="date" {...register('date_debut')} />
                {errors.date_debut && (
                  <p className="text-sm text-destructive">{errors.date_debut.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_fin">Date de fin *</Label>
                <Input id="date_fin" type="date" {...register('date_fin')} />
                {errors.date_fin && (
                  <p className="text-sm text-destructive">{errors.date_fin.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Remuneration section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Euro className="size-4" />
              <span>Remuneration</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remuneration_forfait">Forfait annuel (EUR)</Label>
              <Input id="remuneration_forfait" type="number" step="0.01" {...register('remuneration_forfait')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestations_incluses">Prestations incluses dans le forfait</Label>
              <Input id="prestations_incluses" {...register('prestations_incluses')} placeholder="Gestion courante, convocations AG..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestations_particulieres">Prestations particulieres (hors forfait)</Label>
              <Input id="prestations_particulieres" {...register('prestations_particulieres')} placeholder="Travaux exceptionnels, contentieux..." />
            </div>
          </div>

          <Separator />

          {/* Conditions section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Conditions et notes</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions_execution">Conditions d'execution</Label>
              <Input id="conditions_execution" {...register('conditions_execution')} placeholder="Conditions d'execution de la mission..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...register('notes')} placeholder="Notes supplementaires..." />
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
