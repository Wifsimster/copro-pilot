import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin } from 'lucide-react'
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
import type { Coproprietaire } from '@/types'

const coproprietaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prenom est obligatoire'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse_correspondance: z.string().optional(),
})

type CoproprietaireFormData = z.infer<typeof coproprietaireSchema>

interface CoproprietaireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Coproprietaire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Coproprietaire>
  title?: string
}

export function CoproprietaireFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau coproprietaire',
}: CoproprietaireFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoproprietaireFormData>({
    resolver: zodResolver(coproprietaireSchema),
    defaultValues: {
      nom: defaultValues?.nom || '',
      prenom: defaultValues?.prenom || '',
      email: defaultValues?.email || '',
      telephone: defaultValues?.telephone || '',
      adresse_correspondance: defaultValues?.adresse_correspondance || '',
    },
  })

  const handleFormSubmit = async (data: CoproprietaireFormData) => {
    await onSubmit({
      ...data,
      email: data.email || null,
      telephone: data.telephone || null,
      adresse_correspondance: data.adresse_correspondance || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations du coproprietaire. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Identity section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="size-4" />
              <span>Identite</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prenom">Prenom *</Label>
                <Input id="prenom" {...register('prenom')} placeholder="Jean" />
                {errors.prenom && (
                  <p className="text-sm text-destructive">{errors.prenom.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input id="nom" {...register('nom')} placeholder="Dupont" />
                {errors.nom && (
                  <p className="text-sm text-destructive">{errors.nom.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="size-4" />
              <span>Coordonnees</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="jean.dupont@email.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone" className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  Telephone
                </Label>
                <Input
                  id="telephone"
                  {...register('telephone')}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse_correspondance" className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                Adresse de correspondance
              </Label>
              <Input
                id="adresse_correspondance"
                {...register('adresse_correspondance')}
                placeholder="12 rue de la Paix, 75001 Paris"
              />
            </div>
          </div>

          <Separator />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
