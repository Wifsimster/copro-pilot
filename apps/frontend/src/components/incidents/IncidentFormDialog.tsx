import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertTriangle, Tag } from 'lucide-react'
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
import type { Incident } from '@/types'

const incidentSchema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  categorie: z.string().optional(),
  urgence: z.enum(['faible', 'moyenne', 'haute', 'critique']),
  statut: z.enum(['ouvert', 'en_cours', 'resolu', 'ferme']),
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
      statut: defaultValues?.statut || 'ouvert',
      date_signalement: defaultValues?.date_signalement || new Date().toISOString().split('T')[0],
    },
  })

  const currentUrgence = watch('urgence')
  const currentStatut = watch('statut')

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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Decrivez l'incident rencontre. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Incident details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <AlertTriangle className="size-4" />
              <span>Description de l'incident</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="titre">Titre *</Label>
              <Input id="titre" {...register('titre')} placeholder="Fuite d'eau au 3e etage..." />
              {errors.titre && (
                <p className="text-sm text-destructive">{errors.titre.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea {...register('description')} rows={3} placeholder="Details de l'incident..." />
            </div>
          </div>

          <Separator />

          {/* Classification section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="size-4" />
              <span>Classification</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categorie">Categorie</Label>
                <Input id="categorie" {...register('categorie')} placeholder="Plomberie, Electricite..." />
              </div>
              <div className="space-y-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statut">Statut *</Label>
                <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as IncidentFormData['statut'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="resolu">Resolu</SelectItem>
                    <SelectItem value="ferme">Ferme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_signalement">Date de signalement *</Label>
                <Input id="date_signalement" type="date" {...register('date_signalement')} />
                {errors.date_signalement && (
                  <p className="text-sm text-destructive">{errors.date_signalement.message}</p>
                )}
              </div>
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
