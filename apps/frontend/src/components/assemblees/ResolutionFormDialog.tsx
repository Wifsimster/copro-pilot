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
import type { Resolution, TypeMajorite } from '@/types'

const schema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  majorite: z.enum(['article_24', 'article_25', 'article_26', 'unanimite']),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  agId: number
  numero: number
  onSubmit: (data: Partial<Resolution>) => Promise<void>
  isLoading?: boolean
}

export function ResolutionFormDialog({ open, onOpenChange, agId, numero, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { titre: '', description: '', majorite: 'article_24' },
  })

  const currentMajorite = watch('majorite')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      ag_id: agId,
      numero,
      titre: data.titre,
      description: data.description || null,
      majorite: data.majorite as TypeMajorite,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resolution #{numero}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titre">Titre *</Label>
            <Input id="titre" {...register('titre')} placeholder="Approbation des comptes..." />
            {errors.titre && <p className="mt-1 text-sm text-red-500">{errors.titre.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register('description')} placeholder="Details de la resolution..." />
          </div>
          <div>
            <Label htmlFor="majorite">Majorite requise *</Label>
            <Select value={currentMajorite} onValueChange={(val) => setValue('majorite', val as FormData['majorite'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="article_24">Article 24 (majorite simple)</SelectItem>
                <SelectItem value="article_25">Article 25 (majorite absolue)</SelectItem>
                <SelectItem value="article_26">Article 26 (double majorite)</SelectItem>
                <SelectItem value="unanimite">Unanimite</SelectItem>
              </SelectContent>
            </Select>
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
