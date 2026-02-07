import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardCheck, CalendarDays, FileText } from 'lucide-react'
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
import type { Diagnostic } from '@/types'

const diagnosticSchema = z.object({
  type: z.enum(['dpe', 'amiante', 'plomb', 'dtg', 'ppt', 'gaz', 'electricite', 'autre']),
  prestataire: z.string().optional(),
  date_realisation: z.string().min(1, 'La date de realisation est obligatoire'),
  date_validite: z.string().optional(),
  statut: z.enum(['valide', 'expire', 'a_renouveler']),
  document_url: z.string().optional(),
  observations: z.string().optional(),
})

type DiagnosticFormData = z.infer<typeof diagnosticSchema>

interface DiagnosticFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Diagnostic>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Diagnostic>
  title?: string
}

const TYPE_LABELS: Record<string, string> = {
  dpe: 'DPE',
  amiante: 'Amiante',
  plomb: 'Plomb',
  dtg: 'DTG',
  ppt: 'PPT',
  gaz: 'Gaz',
  electricite: 'Electricite',
  autre: 'Autre',
}

const STATUT_LABELS: Record<string, string> = {
  valide: 'Valide',
  expire: 'Expire',
  a_renouveler: 'A renouveler',
}

export function DiagnosticFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau diagnostic',
}: DiagnosticFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DiagnosticFormData>({
    resolver: zodResolver(diagnosticSchema),
    defaultValues: {
      type: defaultValues?.type || 'dpe',
      prestataire: defaultValues?.prestataire || '',
      date_realisation: defaultValues?.date_realisation || new Date().toISOString().split('T')[0],
      date_validite: defaultValues?.date_validite || '',
      statut: defaultValues?.statut || 'valide',
      document_url: defaultValues?.document_url || '',
      observations: defaultValues?.observations || '',
    },
  })

  const currentType = watch('type')
  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: DiagnosticFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      prestataire: data.prestataire || null,
      date_validite: data.date_validite || null,
      document_url: data.document_url || null,
      observations: data.observations || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du diagnostic technique. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Type & Statut section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ClipboardCheck className="size-4" />
              <span>Type et statut</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentType} onValueChange={(val) => setValue('type', val as DiagnosticFormData['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as DiagnosticFormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestataire">Prestataire</Label>
              <Input id="prestataire" {...register('prestataire')} placeholder="Nom du prestataire..." />
            </div>
          </div>

          <Separator />

          {/* Dates section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Dates</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_realisation">Date de realisation *</Label>
                <Input id="date_realisation" type="date" {...register('date_realisation')} />
                {errors.date_realisation && (
                  <p className="text-sm text-destructive">{errors.date_realisation.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_validite">Date de validite</Label>
                <Input id="date_validite" type="date" {...register('date_validite')} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Details</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_url">URL du document</Label>
              <Input id="document_url" {...register('document_url')} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Input id="observations" {...register('observations')} placeholder="Observations..." />
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
