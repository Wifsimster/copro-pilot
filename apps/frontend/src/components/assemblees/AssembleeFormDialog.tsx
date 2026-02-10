import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, MapPin, FileText } from 'lucide-react'
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
import type { AssembleeGenerale } from '@/types'

const agSchema = z.object({
  date: z.string().min(1, 'La date est obligatoire'),
  heure: z.string().optional(),
  lieu: z.string().optional(),
  type: z.enum(['ordinaire', 'extraordinaire']),
  ordre_du_jour: z.string().optional(),
})

type AGFormData = z.infer<typeof agSchema>

interface AssembleeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<AssembleeGenerale>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<AssembleeGenerale>
  title?: string
}

export function AssembleeFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle assemblee generale',
}: AssembleeFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AGFormData>({
    resolver: zodResolver(agSchema),
    defaultValues: {
      date: defaultValues?.date || '',
      heure: defaultValues?.heure || '',
      lieu: defaultValues?.lieu || '',
      type: defaultValues?.type || 'ordinaire',
      ordre_du_jour: defaultValues?.ordre_du_jour || '',
    },
  })

  const currentType = watch('type')

  const handleFormSubmit = async (data: AGFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      heure: data.heure || null,
      lieu: data.lieu || null,
      ordre_du_jour: data.ordre_du_jour || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Planifiez une assemblee generale. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Date & type section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Date et type</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="heure">Heure</Label>
                <Input id="heure" type="time" {...register('heure')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select value={currentType} onValueChange={(val) => setValue('type', val as AGFormData['type'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ordinaire">Ordinaire</SelectItem>
                    <SelectItem value="extraordinaire">Extraordinaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lieu" className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-muted-foreground" />
                  Lieu
                </Label>
                <Input id="lieu" {...register('lieu')} placeholder="Salle des fetes..." />
              </div>
            </div>
          </div>

          <Separator />

          {/* Agenda section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Ordre du jour</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ordre_du_jour">Ordre du jour</Label>
              <Textarea rows={3} {...register('ordre_du_jour')} placeholder="Points a l'ordre du jour..." />
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
