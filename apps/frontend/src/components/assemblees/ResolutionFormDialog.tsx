import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Vote, FileText } from 'lucide-react'
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
          <DialogDescription>
            Ajoutez une resolution a l'ordre du jour. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Resolution details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Contenu</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input id="titre" {...register('titre')} placeholder="Approbation des comptes..." />
              {errors.titre && (
                <p className="text-sm text-destructive">{errors.titre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} placeholder="Details de la resolution..." />
            </div>
          </div>

          <Separator />

          {/* Vote section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Vote className="size-4" />
              <span>Regles de vote</span>
            </div>

            <div className="space-y-2">
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
