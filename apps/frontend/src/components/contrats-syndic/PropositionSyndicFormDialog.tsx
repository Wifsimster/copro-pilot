import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Euro, FileText } from 'lucide-react'
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
import type { PropositionSyndic } from '@/types'

const propositionSyndicSchema = z.object({
  syndic_nom: z.string().min(1, 'Le nom du syndic est obligatoire'),
  date_reception: z.string().min(1, 'La date de reception est obligatoire'),
  montant_propose: z.coerce.number().optional(),
  prestations_proposees: z.string().optional(),
  document_url: z.string().optional(),
  retenue: z.string(),
  notes: z.string().optional(),
})

type PropositionSyndicFormData = z.infer<typeof propositionSyndicSchema>

interface PropositionSyndicFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<PropositionSyndic>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<PropositionSyndic>
  title?: string
}

export function PropositionSyndicFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle proposition',
}: PropositionSyndicFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PropositionSyndicFormData>({
    resolver: zodResolver(propositionSyndicSchema),
    defaultValues: {
      syndic_nom: defaultValues?.syndic_nom || '',
      date_reception: defaultValues?.date_reception || new Date().toISOString().slice(0, 10),
      montant_propose: defaultValues?.montant_propose || 0,
      prestations_proposees: defaultValues?.prestations_proposees || '',
      document_url: defaultValues?.document_url || '',
      retenue: defaultValues?.retenue ? 'oui' : 'non',
      notes: defaultValues?.notes || '',
    },
  })

  const currentRetenue = watch('retenue')

  const handleFormSubmit = async (data: PropositionSyndicFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      montant_propose: data.montant_propose || null,
      prestations_proposees: data.prestations_proposees || null,
      document_url: data.document_url || null,
      retenue: data.retenue === 'oui',
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
            Enregistrez une proposition de contrat de syndic pour la mise en concurrence.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Syndic section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="size-4" />
              <span>Syndic candidat</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="syndic_nom">Nom du syndic *</Label>
              <Input id="syndic_nom" {...register('syndic_nom')} placeholder="Nom du cabinet de syndic" />
              {errors.syndic_nom && (
                <p className="text-sm text-destructive">{errors.syndic_nom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_reception">Date de reception *</Label>
              <Input id="date_reception" type="date" {...register('date_reception')} />
              {errors.date_reception && (
                <p className="text-sm text-destructive">{errors.date_reception.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Montant section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Euro className="size-4" />
              <span>Proposition financiere</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="montant_propose">Montant propose (EUR/an)</Label>
              <Input id="montant_propose" type="number" step="0.01" {...register('montant_propose')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestations_proposees">Prestations proposees</Label>
              <Input id="prestations_proposees" {...register('prestations_proposees')} placeholder="Detail des prestations proposees..." />
            </div>
          </div>

          <Separator />

          {/* Decision section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Decision et notes</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="retenue">Proposition retenue</Label>
                <Select value={currentRetenue} onValueChange={(val) => setValue('retenue', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non">Non</SelectItem>
                    <SelectItem value="oui">Oui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_url">URL du document</Label>
                <Input id="document_url" {...register('document_url')} placeholder="Lien vers le document" />
              </div>
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
