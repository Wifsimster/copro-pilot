import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, CalendarDays, FileText } from 'lucide-react'
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
import type { ReglementCopropriete } from '@/types'

const reglementSchema = z.object({
  date_etablissement: z.string().min(1, 'La date est obligatoire'),
  date_derniere_modification: z.string().optional(),
  notaire: z.string().optional(),
  destination_immeuble: z.enum(['habitation', 'commerce', 'mixte']),
  restrictions_usage: z.string().optional(),
  conditions_travaux: z.string().optional(),
  composition_conseil_syndical: z.string().optional(),
  modalites_convocation_ag: z.string().optional(),
  document_url: z.string().optional(),
  notes: z.string().optional(),
})

type ReglementFormData = z.infer<typeof reglementSchema>

interface ReglementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<ReglementCopropriete>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ReglementCopropriete>
  title?: string
}

export function ReglementFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau reglement',
}: ReglementFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReglementFormData>({
    resolver: zodResolver(reglementSchema),
    defaultValues: {
      date_etablissement: defaultValues?.date_etablissement || new Date().toISOString().split('T')[0],
      date_derniere_modification: defaultValues?.date_derniere_modification || '',
      notaire: defaultValues?.notaire || '',
      destination_immeuble: defaultValues?.destination_immeuble || 'habitation',
      restrictions_usage: defaultValues?.restrictions_usage || '',
      conditions_travaux: defaultValues?.conditions_travaux || '',
      composition_conseil_syndical: defaultValues?.composition_conseil_syndical || '',
      modalites_convocation_ag: defaultValues?.modalites_convocation_ag || '',
      document_url: defaultValues?.document_url || '',
      notes: defaultValues?.notes || '',
    },
  })

  const currentDestination = watch('destination_immeuble')

  const handleFormSubmit = async (data: ReglementFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_derniere_modification: data.date_derniere_modification || null,
      notaire: data.notaire || null,
      restrictions_usage: data.restrictions_usage || null,
      conditions_travaux: data.conditions_travaux || null,
      composition_conseil_syndical: data.composition_conseil_syndical || null,
      modalites_convocation_ag: data.modalites_convocation_ag || null,
      document_url: data.document_url || null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du reglement de copropriete. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* General info section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookOpen className="size-4" />
              <span>Informations generales</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_etablissement">Date d'etablissement *</Label>
                <Input id="date_etablissement" type="date" {...register('date_etablissement')} />
                {errors.date_etablissement && (
                  <p className="text-sm text-destructive">{errors.date_etablissement.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_derniere_modification">Derniere modification</Label>
                <Input id="date_derniere_modification" type="date" {...register('date_derniere_modification')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notaire">Notaire</Label>
                <Input id="notaire" {...register('notaire')} placeholder="Me Dupont..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination_immeuble">Destination *</Label>
                <Select value={currentDestination} onValueChange={(val) => setValue('destination_immeuble', val as ReglementFormData['destination_immeuble'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="habitation">Habitation</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Clauses section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Clauses et conditions</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restrictions_usage">Restrictions d'usage</Label>
              <Textarea {...register('restrictions_usage')} rows={2} placeholder="Restrictions d'usage des parties privatives..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions_travaux">Conditions de travaux</Label>
              <Textarea {...register('conditions_travaux')} rows={2} placeholder="Conditions pour la realisation de travaux..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="composition_conseil_syndical">Composition du conseil syndical</Label>
              <Textarea {...register('composition_conseil_syndical')} rows={2} placeholder="Composition et regles du conseil syndical..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modalites_convocation_ag">Modalites de convocation AG</Label>
              <Textarea {...register('modalites_convocation_ag')} rows={2} placeholder="Modalites de convocation des assemblees generales..." />
            </div>
          </div>

          <Separator />

          {/* Document & notes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Document et notes</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_url">URL du document</Label>
              <Input id="document_url" {...register('document_url')} placeholder="https://..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea {...register('notes')} rows={3} placeholder="Notes complementaires..." />
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
