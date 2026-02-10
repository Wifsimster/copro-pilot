import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileWarning, CalendarDays, Banknote } from 'lucide-react'
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
import type { Sinistre, Assurance, Incident } from '@/types'

const sinistreSchema = z.object({
  assurance_id: z.string().optional(),
  incident_id: z.string().optional(),
  numero_sinistre: z.string().optional(),
  date_sinistre: z.string().min(1, 'La date du sinistre est obligatoire'),
  date_declaration: z.string().optional(),
  description: z.string().optional(),
  montant_estime: z.string().optional(),
  montant_indemnise: z.string().optional(),
  statut: z.enum(['declare', 'en_instruction', 'accepte', 'refuse', 'clos']),
  notes: z.string().optional(),
})

type SinistreFormData = z.infer<typeof sinistreSchema>

interface SinistreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Sinistre>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Sinistre>
  title?: string
  assurances?: Assurance[]
  incidents?: Incident[]
}

export function SinistreFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Declarer un sinistre',
  assurances = [],
  incidents = [],
}: SinistreFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SinistreFormData>({
    resolver: zodResolver(sinistreSchema),
    defaultValues: {
      assurance_id: defaultValues?.assurance_id ? String(defaultValues.assurance_id) : '',
      incident_id: defaultValues?.incident_id ? String(defaultValues.incident_id) : '',
      numero_sinistre: defaultValues?.numero_sinistre || '',
      date_sinistre: defaultValues?.date_sinistre || new Date().toISOString().split('T')[0],
      date_declaration: defaultValues?.date_declaration || '',
      description: defaultValues?.description || '',
      montant_estime: defaultValues?.montant_estime != null ? String(defaultValues.montant_estime) : '',
      montant_indemnise: defaultValues?.montant_indemnise != null ? String(defaultValues.montant_indemnise) : '',
      statut: defaultValues?.statut || 'declare',
      notes: defaultValues?.notes || '',
    },
  })

  const currentStatut = watch('statut')
  const currentAssuranceId = watch('assurance_id')
  const currentIncidentId = watch('incident_id')

  const handleFormSubmit = async (data: SinistreFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      assurance_id: data.assurance_id ? parseInt(data.assurance_id) : null,
      incident_id: data.incident_id ? parseInt(data.incident_id) : null,
      numero_sinistre: data.numero_sinistre || null,
      date_declaration: data.date_declaration || null,
      description: data.description || null,
      montant_estime: data.montant_estime ? parseFloat(data.montant_estime) : null,
      montant_indemnise: data.montant_indemnise ? parseFloat(data.montant_indemnise) : null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du sinistre. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Sinistre details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileWarning className="size-4" />
              <span>Informations du sinistre</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_sinistre">Numero de sinistre</Label>
                <Input id="numero_sinistre" {...register('numero_sinistre')} placeholder="SIN-2025-00001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as SinistreFormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="declare">Declare</SelectItem>
                    <SelectItem value="en_instruction">En instruction</SelectItem>
                    <SelectItem value="accepte">Accepte</SelectItem>
                    <SelectItem value="refuse">Refuse</SelectItem>
                    <SelectItem value="clos">Clos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="Description du sinistre..." />
            </div>

            {/* Linked assurance */}
            <div className="space-y-2">
              <Label htmlFor="assurance_id">Assurance liee</Label>
              <Select value={currentAssuranceId || ''} onValueChange={(val) => setValue('assurance_id', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {assurances.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.compagnie} — {a.numero_police || 'N/A'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Linked incident */}
            <div className="space-y-2">
              <Label htmlFor="incident_id">Incident lie</Label>
              <Select value={currentIncidentId || ''} onValueChange={(val) => setValue('incident_id', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucun</SelectItem>
                  {incidents.map((i) => (
                    <SelectItem key={i.id} value={String(i.id)}>
                      {i.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Dates</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_sinistre">Date du sinistre *</Label>
                <Input id="date_sinistre" type="date" {...register('date_sinistre')} />
                {errors.date_sinistre && (
                  <p className="text-sm text-destructive">{errors.date_sinistre.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_declaration">Date de declaration</Label>
                <Input id="date_declaration" type="date" {...register('date_declaration')} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Banknote className="size-4" />
              <span>Montants</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant_estime">Montant estime</Label>
                <Input id="montant_estime" type="number" step="0.01" {...register('montant_estime')} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant_indemnise">Montant indemnise</Label>
                <Input id="montant_indemnise" type="number" step="0.01" {...register('montant_indemnise')} placeholder="0.00" />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} placeholder="Informations complementaires..." />
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
