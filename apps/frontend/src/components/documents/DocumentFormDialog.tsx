import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, StickyNote } from 'lucide-react'
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
import type { Document } from '@/types'

const schema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  categorie: z.string().min(1),
  fichier_nom: z.string().min(1, 'Le nom de fichier est obligatoire'),
  fichier_path: z.string().min(1, 'Le chemin du fichier est obligatoire'),
  description: z.string().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Document>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Document>
  title?: string
}

const CATEGORIES = [
  { value: 'pv_ag', label: 'PV d\'AG' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'facture', label: 'Facture' },
  { value: 'devis', label: 'Devis' },
  { value: 'reglement', label: 'Reglement' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'courrier', label: 'Courrier' },
  { value: 'autre', label: 'Autre' },
]

export function DocumentFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau document',
}: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: defaultValues?.nom ?? '',
      categorie: defaultValues?.categorie ?? 'autre',
      fichier_nom: defaultValues?.fichier_nom ?? '',
      fichier_path: defaultValues?.fichier_path ?? '',
      description: defaultValues?.description ?? '',
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        nom: defaultValues?.nom ?? '',
        categorie: defaultValues?.categorie ?? 'autre',
        fichier_nom: defaultValues?.fichier_nom ?? '',
        fichier_path: defaultValues?.fichier_path ?? '',
        description: defaultValues?.description ?? '',
      })
    }
  }, [open, defaultValues, reset])

  const currentCategorie = watch('categorie')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      copropriete_id: coproprieteId,
      nom: data.nom,
      categorie: data.categorie as Document['categorie'],
      fichier_nom: data.fichier_nom,
      fichier_path: data.fichier_path,
      description: data.description || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Ajoutez un document a la copropriete. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Informations</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">Nom du document *</Label>
              <Input id="nom" {...register('nom')} placeholder="Ex: PV AG 2025" />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categorie">Categorie</Label>
                <Select value={currentCategorie} onValueChange={(val) => setValue('categorie', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fichier_nom">Nom du fichier *</Label>
                <Input id="fichier_nom" {...register('fichier_nom')} placeholder="document.pdf" />
                {errors.fichier_nom && (
                  <p className="text-sm text-destructive">{errors.fichier_nom.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fichier_path">Chemin / URL du fichier *</Label>
              <Input id="fichier_path" {...register('fichier_path')} placeholder="/documents/..." />
              {errors.fichier_path && (
                <p className="text-sm text-destructive">{errors.fichier_path.message}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <StickyNote className="size-4" />
              <span>Notes</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea {...register('description')} rows={3} placeholder="Description du document..." />
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
