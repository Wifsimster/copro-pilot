import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ListOrdered, FileText } from 'lucide-react'
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
import type { ArticleReglement } from '@/types'

const articleSchema = z.object({
  numero: z.string().min(1, 'Le numero est obligatoire'),
  titre: z.string().min(1, 'Le titre est obligatoire'),
  contenu: z.string().optional(),
  categorie: z.enum(['parties_privatives', 'parties_communes', 'charges', 'usage', 'travaux', 'conseil_syndical', 'ag', 'autre']),
  ordre: z.coerce.number().int().min(0),
  notes: z.string().optional(),
})

type ArticleFormData = z.infer<typeof articleSchema>

interface ArticleReglementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reglementId: number
  onSubmit: (data: Partial<ArticleReglement>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ArticleReglement>
  title?: string
}

export function ArticleReglementFormDialog({
  open,
  onOpenChange,
  reglementId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvel article',
}: ArticleReglementFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      numero: defaultValues?.numero || '',
      titre: defaultValues?.titre || '',
      contenu: defaultValues?.contenu || '',
      categorie: defaultValues?.categorie || 'autre',
      ordre: defaultValues?.ordre ?? 0,
      notes: defaultValues?.notes || '',
    },
  })

  const currentCategorie = watch('categorie')

  const handleFormSubmit = async (data: ArticleFormData) => {
    await onSubmit({
      ...data,
      reglement_id: reglementId,
      contenu: data.contenu || null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations de l'article du reglement. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Article identification */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ListOrdered className="size-4" />
              <span>Identification</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Numero *</Label>
                <Input id="numero" {...register('numero')} placeholder="Art. 1, 2.1..." />
                {errors.numero && (
                  <p className="text-sm text-destructive">{errors.numero.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ordre">Ordre *</Label>
                <Input id="ordre" type="number" {...register('ordre')} min={0} />
                {errors.ordre && (
                  <p className="text-sm text-destructive">{errors.ordre.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input id="titre" {...register('titre')} placeholder="Titre de l'article..." />
              {errors.titre && (
                <p className="text-sm text-destructive">{errors.titre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="categorie">Categorie *</Label>
              <Select value={currentCategorie} onValueChange={(val) => setValue('categorie', val as ArticleFormData['categorie'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parties_privatives">Parties privatives</SelectItem>
                  <SelectItem value="parties_communes">Parties communes</SelectItem>
                  <SelectItem value="charges">Charges</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="travaux">Travaux</SelectItem>
                  <SelectItem value="conseil_syndical">Conseil syndical</SelectItem>
                  <SelectItem value="ag">Assemblee generale</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Content section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Contenu</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contenu">Contenu de l'article</Label>
              <Textarea {...register('contenu')} rows={5} placeholder="Texte complet de l'article..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea {...register('notes')} rows={2} placeholder="Notes complementaires..." />
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
