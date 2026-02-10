import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, CalendarDays, Banknote } from 'lucide-react'
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
import type { Assurance } from '@/types'

const assuranceSchema = z.object({
  compagnie: z.string().min(1, 'La compagnie est obligatoire'),
  numero_police: z.string().optional(),
  type: z.enum(['multirisque_immeuble', 'responsabilite_civile', 'dommages_ouvrage', 'protection_juridique', 'autre']),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().optional(),
  prime_annuelle: z.string().optional(),
  franchise: z.string().optional(),
  statut: z.enum(['actif', 'expire', 'resilie']),
  notes: z.string().optional(),
})

type AssuranceFormData = z.infer<typeof assuranceSchema>

interface AssuranceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Assurance>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Assurance>
  title?: string
}

export function AssuranceFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle assurance',
}: AssuranceFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssuranceFormData>({
    resolver: zodResolver(assuranceSchema),
    defaultValues: {
      compagnie: defaultValues?.compagnie || '',
      numero_police: defaultValues?.numero_police || '',
      type: defaultValues?.type || 'multirisque_immeuble',
      date_debut: defaultValues?.date_debut || new Date().toISOString().split('T')[0],
      date_fin: defaultValues?.date_fin || '',
      prime_annuelle: defaultValues?.prime_annuelle != null ? String(defaultValues.prime_annuelle) : '',
      franchise: defaultValues?.franchise != null ? String(defaultValues.franchise) : '',
      statut: defaultValues?.statut || 'actif',
      notes: defaultValues?.notes || '',
    },
  })

  const currentType = watch('type')
  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: AssuranceFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      numero_police: data.numero_police || null,
      date_fin: data.date_fin || null,
      prime_annuelle: data.prime_annuelle ? parseFloat(data.prime_annuelle) : null,
      franchise: data.franchise ? parseFloat(data.franchise) : null,
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
            Renseignez les informations de la police d'assurance. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Insurance details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="size-4" />
              <span>Informations de la police</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compagnie">Compagnie *</Label>
              <Input id="compagnie" {...register('compagnie')} placeholder="AXA, MAIF, Allianz..." />
              {errors.compagnie && (
                <p className="text-sm text-destructive">{errors.compagnie.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_police">Numero de police</Label>
                <Input id="numero_police" {...register('numero_police')} placeholder="POL-2024-0001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentType} onValueChange={(val) => setValue('type', val as AssuranceFormData['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multirisque_immeuble">Multirisque immeuble</SelectItem>
                    <SelectItem value="responsabilite_civile">Responsabilite civile</SelectItem>
                    <SelectItem value="dommages_ouvrage">Dommages-ouvrage</SelectItem>
                    <SelectItem value="protection_juridique">Protection juridique</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut *</Label>
              <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as AssuranceFormData['statut'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actif">Actif</SelectItem>
                  <SelectItem value="expire">Expire</SelectItem>
                  <SelectItem value="resilie">Resilie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Periode de couverture</span>
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
                <Label htmlFor="prime_annuelle">Prime annuelle</Label>
                <Input id="prime_annuelle" type="number" step="0.01" {...register('prime_annuelle')} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="franchise">Franchise</Label>
                <Input id="franchise" type="number" step="0.01" {...register('franchise')} placeholder="0.00" />
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
