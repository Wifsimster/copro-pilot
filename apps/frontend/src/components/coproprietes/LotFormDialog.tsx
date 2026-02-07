import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Home, Ruler, FileText } from 'lucide-react'
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
  numero: z.string().min(1, 'Le numero est obligatoire'),
  type: z.enum(['appartement', 'cave', 'parking', 'commerce', 'bureau', 'autre']),
  surface: z.coerce.number().positive('La surface doit etre positive').optional().or(z.literal('')),
  etage: z.coerce.number().optional().or(z.literal('')),
  tantiemes: z.coerce.number().min(1, 'Les tantiemes sont obligatoires'),
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
          <DialogDescription>
            Renseignez les informations du lot. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Identification section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Home className="size-4" />
              <span>Identification</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Numero *</Label>
                <Input id="numero" {...register('numero')} placeholder="A101" />
                {errors.numero && (
                  <p className="text-sm text-destructive">{errors.numero.message}</p>
                )}
              </div>
              <div className="space-y-2">
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
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Characteristics section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Ruler className="size-4" />
              <span>Caracteristiques</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="surface">Surface (m²)</Label>
                <Input id="surface" type="number" step="0.01" {...register('surface')} placeholder="45" />
                {errors.surface && (
                  <p className="text-sm text-destructive">{errors.surface.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="etage">Etage</Label>
                <Input id="etage" type="number" {...register('etage')} placeholder="3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tantiemes">Tantiemes *</Label>
                <Input id="tantiemes" type="number" {...register('tantiemes')} placeholder="150" />
                {errors.tantiemes && (
                  <p className="text-sm text-destructive">{errors.tantiemes.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Description section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Description</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="Appartement 3 pieces, balcon..." />
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
