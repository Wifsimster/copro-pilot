import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
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
            <div>
              <Label htmlFor="annee">Annee *</Label>
              <Input id="annee" type="number" {...register('annee')} />
              {errors.annee && <p className="mt-1 text-sm text-red-500">{errors.annee.message}</p>}
            </div>
            <div>
              <Label htmlFor="montant_total">Montant (EUR) *</Label>
              <Input id="montant_total" type="number" step="0.01" {...register('montant_total')} placeholder="12500" />
              {errors.montant_total && <p className="mt-1 text-sm text-red-500">{errors.montant_total.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_emission">Date d'emission *</Label>
              <Input id="date_emission" type="date" {...register('date_emission')} />
              {errors.date_emission && <p className="mt-1 text-sm text-red-500">{errors.date_emission.message}</p>}
            </div>
            <div>
              <Label htmlFor="date_echeance">Date d'echeance *</Label>
              <Input id="date_echeance" type="date" {...register('date_echeance')} />
              {errors.date_echeance && <p className="mt-1 text-sm text-red-500">{errors.date_echeance.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
