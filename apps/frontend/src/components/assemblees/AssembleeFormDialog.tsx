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
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>}
            </div>
            <div>
              <Label htmlFor="heure">Heure</Label>
              <Input id="heure" type="time" {...register('heure')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
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
            <div>
              <Label htmlFor="lieu">Lieu</Label>
              <Input id="lieu" {...register('lieu')} placeholder="Salle des fetes..." />
            </div>
          </div>

          <div>
            <Label htmlFor="ordre_du_jour">Ordre du jour</Label>
            <Input id="ordre_du_jour" {...register('ordre_du_jour')} placeholder="Points a l'ordre du jour..." />
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
