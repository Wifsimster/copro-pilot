import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, User, FileText } from 'lucide-react'
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
import type { Prestataire } from '@/types'

const prestataireSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  siret: z.string().optional(),
  specialite: z.string().optional(),
  contact_nom: z.string().optional(),
  contact_email: z.string().optional(),
  contact_telephone: z.string().optional(),
  adresse: z.string().optional(),
  notes: z.string().optional(),
})

type PrestataireFormData = z.infer<typeof prestataireSchema>

interface PrestataireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Prestataire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Prestataire>
  title?: string
}

export function PrestataireFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau prestataire',
}: PrestataireFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PrestataireFormData>({
    resolver: zodResolver(prestataireSchema),
    defaultValues: {
      nom: defaultValues?.nom || '',
      siret: defaultValues?.siret || '',
      specialite: defaultValues?.specialite || '',
      contact_nom: defaultValues?.contact_nom || '',
      contact_email: defaultValues?.contact_email || '',
      contact_telephone: defaultValues?.contact_telephone || '',
      adresse: defaultValues?.adresse || '',
      notes: defaultValues?.notes || '',
    },
  })

  const currentSpecialite = watch('specialite')

  const handleFormSubmit = async (data: PrestataireFormData) => {
    await onSubmit({
      ...data,
      siret: data.siret || null,
      specialite: data.specialite || null,
      contact_nom: data.contact_nom || null,
      contact_email: data.contact_email || null,
      contact_telephone: data.contact_telephone || null,
      adresse: data.adresse || null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du prestataire. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Informations section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="size-4" />
              <span>Informations</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" {...register('nom')} />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET</Label>
                <Input id="siret" {...register('siret')} placeholder="12345678901234" />
                {errors.siret && (
                  <p className="text-sm text-destructive">{errors.siret.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialite">Specialite</Label>
              <Select value={currentSpecialite} onValueChange={(val) => setValue('specialite', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionnez une specialite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ascenseur">Ascenseur</SelectItem>
                  <SelectItem value="Nettoyage">Nettoyage</SelectItem>
                  <SelectItem value="Gardiennage">Gardiennage</SelectItem>
                  <SelectItem value="Plomberie">Plomberie</SelectItem>
                  <SelectItem value="Electricite">Electricite</SelectItem>
                  <SelectItem value="Chauffage">Chauffage</SelectItem>
                  <SelectItem value="Espaces verts">Espaces verts</SelectItem>
                  <SelectItem value="Securite">Securite</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Contact section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="size-4" />
              <span>Contact</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_nom">Nom du contact</Label>
                <Input id="contact_nom" {...register('contact_nom')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input id="contact_email" type="email" {...register('contact_email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_telephone">Telephone</Label>
                <Input id="contact_telephone" {...register('contact_telephone')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" {...register('adresse')} />
            </div>
          </div>

          <Separator />

          {/* Notes section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="size-4" />
              <span>Notes</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...register('notes')} placeholder="Notes supplementaires..." />
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
