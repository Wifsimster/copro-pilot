import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Euro } from 'lucide-react'
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
import type { Relance } from '@/types'

const relanceSchema = z.object({
  coproprietaire_id: z.coerce.number().min(1, 'Le coproprietaire est obligatoire'),
  type: z.enum(['amiable', 'mise_en_demeure', 'contentieux']),
  date_relance: z.string().min(1, 'La date est obligatoire'),
  montant_du: z.coerce.number().min(0.01, 'Le montant est obligatoire'),
  mode_envoi: z.string().optional(),
  statut: z.enum(['brouillon', 'envoyee', 'accusee_reception', 'sans_effet']),
  notes: z.string().optional(),
})

type RelanceFormData = z.infer<typeof relanceSchema>

interface RelanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Relance>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Relance>
  title?: string
}

export function RelanceFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle relance',
}: RelanceFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RelanceFormData>({
    resolver: zodResolver(relanceSchema),
    defaultValues: {
      coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
      type: defaultValues?.type || 'amiable',
      date_relance: defaultValues?.date_relance || new Date().toISOString().split('T')[0],
      montant_du: defaultValues?.montant_du ?? 0,
      mode_envoi: defaultValues?.mode_envoi || '',
      statut: defaultValues?.statut || 'brouillon',
      notes: defaultValues?.notes || '',
    },
  })

  const currentType = watch('type')
  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: RelanceFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      mode_envoi: data.mode_envoi || null,
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
            Enregistrez une relance pour impayes. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Relance section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="size-4" />
              <span>Relance</span>
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
                <Label htmlFor="type">Type *</Label>
                <Select value={currentType} onValueChange={(val) => setValue('type', val as RelanceFormData['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amiable">Amiable</SelectItem>
                    <SelectItem value="mise_en_demeure">Mise en demeure</SelectItem>
                    <SelectItem value="contentieux">Contentieux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as RelanceFormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="envoyee">Envoyee</SelectItem>
                    <SelectItem value="accusee_reception">Accusee reception</SelectItem>
                    <SelectItem value="sans_effet">Sans effet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Montant & dates section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Euro className="size-4" />
              <span>Montant & dates</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant_du">Montant du (EUR) *</Label>
                <Input id="montant_du" type="number" step="0.01" {...register('montant_du')} placeholder="1500.00" />
                {errors.montant_du && (
                  <p className="text-sm text-destructive">{errors.montant_du.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_relance">Date de relance *</Label>
                <Input id="date_relance" type="date" {...register('date_relance')} />
                {errors.date_relance && (
                  <p className="text-sm text-destructive">{errors.date_relance.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode_envoi">Mode d'envoi</Label>
              <Input id="mode_envoi" {...register('mode_envoi')} placeholder="Email, Courrier recommande..." />
            </div>
          </div>

          <Separator />

          {/* Notes section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...register('notes')} placeholder="Notes complementaires..." />
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
