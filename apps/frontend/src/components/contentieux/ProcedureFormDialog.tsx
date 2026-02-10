import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scale, Gavel, CalendarDays, Euro } from 'lucide-react'
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
import type { Procedure } from '@/types'

const procedureSchema = z.object({
  coproprietaire_id: z.coerce.number().min(1, 'Le coproprietaire est obligatoire'),
  avocat: z.string().optional(),
  tribunal: z.string().optional(),
  reference_dossier: z.string().optional(),
  date_assignation: z.string().optional(),
  date_audience: z.string().optional(),
  date_jugement: z.string().optional(),
  montant_reclame: z.coerce.number().positive().optional().or(z.literal(0)),
  montant_obtenu: z.coerce.number().positive().optional().or(z.literal(0)),
  frais_procedure: z.coerce.number().positive().optional().or(z.literal(0)),
  statut: z.enum(['en_preparation', 'en_cours', 'audience_fixee', 'juge', 'execute', 'clos']),
  decision: z.string().optional(),
  notes: z.string().optional(),
})

type ProcedureFormData = z.infer<typeof procedureSchema>

interface ProcedureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Procedure>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Procedure>
  title?: string
}

export function ProcedureFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle procedure',
}: ProcedureFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
      avocat: defaultValues?.avocat || '',
      tribunal: defaultValues?.tribunal || '',
      reference_dossier: defaultValues?.reference_dossier || '',
      date_assignation: defaultValues?.date_assignation || '',
      date_audience: defaultValues?.date_audience || '',
      date_jugement: defaultValues?.date_jugement || '',
      montant_reclame: defaultValues?.montant_reclame ?? 0,
      montant_obtenu: defaultValues?.montant_obtenu ?? 0,
      frais_procedure: defaultValues?.frais_procedure ?? 0,
      statut: defaultValues?.statut || 'en_preparation',
      decision: defaultValues?.decision || '',
      notes: defaultValues?.notes || '',
    },
  })

  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: ProcedureFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      avocat: data.avocat || null,
      tribunal: data.tribunal || null,
      reference_dossier: data.reference_dossier || null,
      date_assignation: data.date_assignation || null,
      date_audience: data.date_audience || null,
      date_jugement: data.date_jugement || null,
      montant_reclame: data.montant_reclame ? Number(data.montant_reclame) : null,
      montant_obtenu: data.montant_obtenu ? Number(data.montant_obtenu) : null,
      frais_procedure: data.frais_procedure ? Number(data.frais_procedure) : null,
      decision: data.decision || null,
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
            Enregistrez une procedure judiciaire. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Procedure section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Scale className="size-4" />
              <span>Procedure</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coproprietaire_id">Coproprietaire ID *</Label>
              <Input id="coproprietaire_id" type="number" {...register('coproprietaire_id')} placeholder="ID du coproprietaire" />
              {errors.coproprietaire_id && (
                <p className="text-sm text-destructive">{errors.coproprietaire_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as ProcedureFormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_preparation">En preparation</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="audience_fixee">Audience fixee</SelectItem>
                    <SelectItem value="juge">Juge</SelectItem>
                    <SelectItem value="execute">Execute</SelectItem>
                    <SelectItem value="clos">Clos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_dossier">Reference dossier</Label>
                <Input id="reference_dossier" {...register('reference_dossier')} placeholder="REF-2026-001" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Intervenants section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Gavel className="size-4" />
              <span>Intervenants</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="avocat">Avocat</Label>
                <Input id="avocat" {...register('avocat')} placeholder="Me Dupont..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tribunal">Tribunal</Label>
                <Input id="tribunal" {...register('tribunal')} placeholder="TJ Paris..." />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Dates</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_assignation">Assignation</Label>
                <Input id="date_assignation" type="date" {...register('date_assignation')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_audience">Audience</Label>
                <Input id="date_audience" type="date" {...register('date_audience')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_jugement">Jugement</Label>
                <Input id="date_jugement" type="date" {...register('date_jugement')} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Montants section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Euro className="size-4" />
              <span>Montants</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant_reclame">Reclame (EUR)</Label>
                <Input id="montant_reclame" type="number" step="0.01" {...register('montant_reclame')} placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant_obtenu">Obtenu (EUR)</Label>
                <Input id="montant_obtenu" type="number" step="0.01" {...register('montant_obtenu')} placeholder="4500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frais_procedure">Frais (EUR)</Label>
                <Input id="frais_procedure" type="number" step="0.01" {...register('frais_procedure')} placeholder="800" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Decision & notes section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="decision">Decision</Label>
              <Textarea rows={3} {...register('decision')} placeholder="Decision du tribunal..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea rows={3} {...register('notes')} placeholder="Notes complementaires..." />
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
