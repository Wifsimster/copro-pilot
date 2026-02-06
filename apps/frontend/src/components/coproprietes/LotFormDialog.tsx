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
import type { Lot, TypeLot } from '@/types'

const TYPE_OPTIONS: { value: TypeLot; label: string }[] = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'cave', label: 'Cave' },
  { value: 'parking', label: 'Parking' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'autre', label: 'Autre' },
]

const lotSchema = z.object({
  numero: z.string().min(1, 'Le numéro est obligatoire'),
  type: z.enum(['appartement', 'cave', 'parking', 'commerce', 'bureau', 'autre']),
  surface: z.coerce.number().positive('La surface doit être positive').optional().or(z.literal('')),
  etage: z.coerce.number().optional().or(z.literal('')),
  tantiemes: z.coerce.number().min(1, 'Les tantièmes sont obligatoires'),
  description: z.string().optional(),
})

type LotFormData = z.infer<typeof lotSchema>

interface LotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Lot>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Lot>
  title?: string
}

export function LotFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau lot',
}: LotFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LotFormData>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      numero: defaultValues?.numero || '',
      type: defaultValues?.type || 'appartement',
      surface: defaultValues?.surface ?? '',
      etage: defaultValues?.etage ?? '',
      tantiemes: defaultValues?.tantiemes || 0,
      description: defaultValues?.description || '',
    },
  })

  const currentType = watch('type')

  const handleFormSubmit = async (data: LotFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      surface: data.surface === '' ? null : Number(data.surface),
      etage: data.etage === '' ? null : Number(data.etage),
      tantiemes: Number(data.tantiemes),
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero">Numéro *</Label>
              <Input id="numero" {...register('numero')} placeholder="A101" />
              {errors.numero && <p className="mt-1 text-sm text-red-500">{errors.numero.message}</p>}
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={currentType} onValueChange={(val) => setValue('type', val as TypeLot)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="surface">Surface (m²)</Label>
              <Input id="surface" type="number" step="0.01" {...register('surface')} placeholder="45" />
              {errors.surface && <p className="mt-1 text-sm text-red-500">{errors.surface.message}</p>}
            </div>
            <div>
              <Label htmlFor="etage">Étage</Label>
              <Input id="etage" type="number" {...register('etage')} placeholder="3" />
              {errors.etage && <p className="mt-1 text-sm text-red-500">{errors.etage.message}</p>}
            </div>
            <div>
              <Label htmlFor="tantiemes">Tantièmes *</Label>
              <Input id="tantiemes" type="number" {...register('tantiemes')} placeholder="150" />
              {errors.tantiemes && <p className="mt-1 text-sm text-red-500">{errors.tantiemes.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Appartement 3 pièces, balcon..." />
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
