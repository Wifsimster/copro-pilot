import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, CalendarDays, Shield } from 'lucide-react'
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
import type { Contrat, Prestataire } from '@/types'

const contratSchema = z.object({
  prestataire_id: z.coerce.number().min(1, 'Le prestataire est obligatoire'),
  objet: z.string().min(1, 'L\'objet est obligatoire'),
  type: z.string().optional(),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().optional(),
  montant_annuel: z.coerce.number().optional(),
  frequence_paiement: z.enum(['mensuel', 'trimestriel', 'semestriel', 'annuel']),
  preavis_mois: z.coerce.number().optional(),
  reconduction_tacite: z.boolean(),
  conditions_resiliation: z.string().optional(),
  statut: z.enum(['actif', 'expire', 'resilie', 'en_attente']),
  notes: z.string().optional(),
})

type ContratFormData = z.infer<typeof contratSchema>

interface ContratFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  prestataires: Prestataire[]
  onSubmit: (data: Partial<Contrat>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Contrat>
  title?: string
}

export function ContratFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  prestataires,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau contrat',
}: ContratFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContratFormData>({
    resolver: zodResolver(contratSchema),
    defaultValues: {
      prestataire_id: defaultValues?.prestataire_id || 0,
      objet: defaultValues?.objet || '',
      type: defaultValues?.type || '',
      date_debut: defaultValues?.date_debut || new Date().toISOString().slice(0, 10),
      date_fin: defaultValues?.date_fin || '',
      montant_annuel: defaultValues?.montant_annuel || 0,
      frequence_paiement: defaultValues?.frequence_paiement || 'annuel',
      preavis_mois: defaultValues?.preavis_mois || 0,
      reconduction_tacite: defaultValues?.reconduction_tacite ?? true,
      conditions_resiliation: defaultValues?.conditions_resiliation || '',
      statut: defaultValues?.statut || 'actif',
      notes: defaultValues?.notes || '',
    },
  })

  const currentPrestataireId = watch('prestataire_id')
  const currentType = watch('type')
  const currentFrequence = watch('frequence_paiement')
  const currentStatut = watch('statut')
  const currentReconduction = watch('reconduction_tacite')

  const handleFormSubmit = async (data: ContratFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      type: data.type || null,
      date_fin: data.date_fin || null,
      montant_annuel: data.montant_annuel || null,
      preavis_mois: data.preavis_mois || null,
      conditions_resiliation: data.conditions_resiliation || null,
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
            Definissez les informations du contrat. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Contrat section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Contrat</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prestataire_id">Prestataire *</Label>
              <Select
                value={currentPrestataireId ? String(currentPrestataireId) : ''}
                onValueChange={(val) => setValue('prestataire_id', Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez un prestataire" />
                </SelectTrigger>
                <SelectContent>
                  {prestataires.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nom}{p.specialite ? ` - ${p.specialite}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.prestataire_id && (
                <p className="text-sm text-destructive">{errors.prestataire_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="objet">Objet *</Label>
              <Input id="objet" {...register('objet')} placeholder="Objet du contrat" />
              {errors.objet && (
                <p className="text-sm text-destructive">{errors.objet.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={currentType || ''} onValueChange={(val) => setValue('type', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="entretien">Entretien</SelectItem>
                    <SelectItem value="gardiennage">Gardiennage</SelectItem>
                    <SelectItem value="assurance">Assurance</SelectItem>
                    <SelectItem value="nettoyage">Nettoyage</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as ContratFormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="expire">Expire</SelectItem>
                    <SelectItem value="resilie">Resilie</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates et montant section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Dates et montant</span>
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
                <Label htmlFor="date_fin">Date de fin</Label>
                <Input id="date_fin" type="date" {...register('date_fin')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant_annuel">Montant annuel (EUR)</Label>
                <Input id="montant_annuel" type="number" step="0.01" {...register('montant_annuel')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequence_paiement">Frequence de paiement *</Label>
                <Select value={currentFrequence} onValueChange={(val) => setValue('frequence_paiement', val as ContratFormData['frequence_paiement'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="trimestriel">Trimestriel</SelectItem>
                    <SelectItem value="semestriel">Semestriel</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Conditions section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="size-4" />
              <span>Conditions</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preavis_mois">Preavis (mois)</Label>
                <Input id="preavis_mois" type="number" {...register('preavis_mois')} placeholder="3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reconduction_tacite">Reconduction tacite</Label>
                <Select value={currentReconduction ? 'oui' : 'non'} onValueChange={(val) => setValue('reconduction_tacite', val === 'oui')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oui">Oui</SelectItem>
                    <SelectItem value="non">Non</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions_resiliation">Conditions de resiliation</Label>
              <Textarea rows={3} {...register('conditions_resiliation')} placeholder="Conditions de resiliation..." />
            </div>
          </div>

          <Separator />

          {/* Notes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Notes</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea rows={3} {...register('notes')} placeholder="Notes supplementaires..." />
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
