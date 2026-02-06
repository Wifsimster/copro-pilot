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
import type { Incident } from '@/types'

const incidentSchema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  categorie: z.string().optional(),
  urgence: z.enum(['faible', 'moyenne', 'haute', 'critique']),
  date_signalement: z.string().min(1, 'La date est obligatoire'),
})

type IncidentFormData = z.infer<typeof incidentSchema>

interface IncidentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Incident>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Incident>
  title?: string
}

export function IncidentFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Signaler un incident',
}: IncidentFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      titre: defaultValues?.titre || '',
      description: defaultValues?.description || '',
      categorie: defaultValues?.categorie || '',
      urgence: defaultValues?.urgence || 'moyenne',
      date_signalement: defaultValues?.date_signalement || new Date().toISOString().split('T')[0],
    },
  })

  const currentUrgence = watch('urgence')

  const handleFormSubmit = async (data: IncidentFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      description: data.description || null,
      categorie: data.categorie || null,
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
          <div>
            <Label htmlFor="titre">Titre *</Label>
            <Input id="titre" {...register('titre')} placeholder="Fuite d'eau au 3e etage..." />
            {errors.titre && <p className="mt-1 text-sm text-red-500">{errors.titre.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Details de l'incident..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="categorie">Categorie</Label>
              <Input id="categorie" {...register('categorie')} placeholder="Plomberie, Electricite..." />
            </div>
            <div>
              <Label htmlFor="urgence">Urgence *</Label>
              <Select value={currentUrgence} onValueChange={(val) => setValue('urgence', val as IncidentFormData['urgence'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="faible">Faible</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="critique">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="date_signalement">Date de signalement *</Label>
            <Input id="date_signalement" type="date" {...register('date_signalement')} />
            {errors.date_signalement && <p className="mt-1 text-sm text-red-500">{errors.date_signalement.message}</p>}
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
