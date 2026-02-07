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
import type { PartieCommune } from '@/types'

const schema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  categorie: z.enum(['generales', 'speciales']),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<PartieCommune>) => Promise<void>
  isLoading?: boolean
}

export function PartieCommuneFormDialog({ open, onOpenChange, coproprieteId, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nom: '', categorie: 'generales', description: '' },
  })

  const currentCategorie = watch('categorie')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({ ...data, copropriete_id: coproprieteId, description: data.description || null })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle partie commune</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom *</Label>
            <Input id="nom" {...register('nom')} placeholder="Hall d'entree, Jardin..." />
            {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom.message}</p>}
          </div>
          <div>
            <Label htmlFor="categorie">Categorie *</Label>
            <Select value={currentCategorie} onValueChange={(val) => setValue('categorie', val as FormData['categorie'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generales">Generales</SelectItem>
                <SelectItem value="speciales">Speciales</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Description..." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700">Annuler</button>
            <button type="submit" disabled={isLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50">{isLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
