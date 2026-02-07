import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Receipt, CalendarDays } from 'lucide-react'
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
import type { AppelFonds } from '@/types'

const appelSchema = z.object({
  trimestre: z.coerce.number().min(1).max(4),
  annee: z.coerce.number().min(2000).max(2100),
  montant_total: z.coerce.number().min(0, 'Le montant doit etre positif'),
  date_emission: z.string().min(1, 'La date est obligatoire'),
  date_echeance: z.string().min(1, 'La date est obligatoire'),
})

type AppelFormData = z.infer<typeof appelSchema>

interface AppelFondsFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<AppelFonds>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<AppelFonds>
  title?: string
}

export function AppelFondsFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvel appel de fonds',
}: AppelFondsFormDialogProps) {
  const now = new Date()
  const defaultTrimestre = Math.ceil((now.getMonth() + 1) / 3)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppelFormData>({
    resolver: zodResolver(appelSchema),
    defaultValues: {
      trimestre: defaultValues?.trimestre || defaultTrimestre,
      annee: defaultValues?.annee || now.getFullYear(),
      montant_total: defaultValues?.montant_total || 0,
      date_emission: defaultValues?.date_emission || now.toISOString().split('T')[0],
      date_echeance: defaultValues?.date_echeance || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  })

  const currentTrimestre = watch('trimestre')

  const handleFormSubmit = async (data: AppelFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Creez un appel de fonds trimestriel. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Period & amount section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Receipt className="size-4" />
              <span>Periode et montant</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trimestre">Trimestre *</Label>
                <Select value={String(currentTrimestre)} onValueChange={(val) => setValue('trimestre', Number(val))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">T1</SelectItem>
                    <SelectItem value="2">T2</SelectItem>
                    <SelectItem value="3">T3</SelectItem>
                    <SelectItem value="4">T4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="annee">Annee *</Label>
                <Input id="annee" type="number" {...register('annee')} />
                {errors.annee && (
                  <p className="text-sm text-destructive">{errors.annee.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="montant_total">Montant (EUR) *</Label>
                <Input id="montant_total" type="number" step="0.01" {...register('montant_total')} placeholder="12500" />
                {errors.montant_total && (
                  <p className="text-sm text-destructive">{errors.montant_total.message}</p>
                )}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_emission">Date d'emission *</Label>
                <Input id="date_emission" type="date" {...register('date_emission')} />
                {errors.date_emission && (
                  <p className="text-sm text-destructive">{errors.date_emission.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_echeance">Date d'echeance *</Label>
                <Input id="date_echeance" type="date" {...register('date_echeance')} />
                {errors.date_echeance && (
                  <p className="text-sm text-destructive">{errors.date_echeance.message}</p>
                )}
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
