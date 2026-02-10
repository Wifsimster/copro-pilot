import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, MapPin, Info } from 'lucide-react'
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
import type { Copropriete } from '@/types'

const coproprieteSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  code_postal: z.string().min(1, 'Le code postal est obligatoire').max(10),
  ville: z.string().min(1, 'La ville est obligatoire'),
  nombre_lots: z.coerce.number().min(0).optional(),
  numero_immatriculation: z.string().optional(),
  nombre_batiments: z.coerce.number().min(0).optional(),
  nombre_ascenseurs: z.coerce.number().min(0).optional(),
  periode_construction: z.string().optional(),
  type_chauffage: z.enum(['individuel', 'collectif', 'mixte']).optional().or(z.literal('')),
  energie_chauffage: z.enum(['gaz', 'electricite', 'fioul', 'bois', 'pompe_chaleur', 'reseau_chaleur', 'autre']).optional().or(z.literal('')),
})

type CoproprieteFormData = z.infer<typeof coproprieteSchema>

interface CoproprieteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Copropriete>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Copropriete>
  title?: string
}

export function CoproprieteFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle copropriete',
}: CoproprieteFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoproprieteFormData>({
    resolver: zodResolver(coproprieteSchema),
    defaultValues: {
      nom: defaultValues?.nom || '',
      adresse: defaultValues?.adresse || '',
      code_postal: defaultValues?.code_postal || '',
      ville: defaultValues?.ville || '',
      nombre_lots: defaultValues?.nombre_lots || 0,
      numero_immatriculation: defaultValues?.numero_immatriculation || '',
      nombre_batiments: defaultValues?.nombre_batiments || 0,
      nombre_ascenseurs: defaultValues?.nombre_ascenseurs || 0,
      periode_construction: defaultValues?.periode_construction || '',
      type_chauffage: defaultValues?.type_chauffage || '',
      energie_chauffage: defaultValues?.energie_chauffage || '',
    },
  })

  const handleFormSubmit = async (data: CoproprieteFormData) => {
    const cleanData = {
      ...data,
      type_chauffage: data.type_chauffage || null,
      energie_chauffage: data.energie_chauffage || null,
    }
    await onSubmit(cleanData)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations de la copropriete. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* General info section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="size-4" />
              <span>Informations generales</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register('nom')} placeholder="Residence Les Tilleuls" />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Address section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <MapPin className="size-4" />
              <span>Adresse</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse *</Label>
              <Input id="adresse" {...register('adresse')} placeholder="12 rue de la Paix" />
              {errors.adresse && (
                <p className="text-sm text-destructive">{errors.adresse.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code_postal">Code postal *</Label>
                <Input id="code_postal" {...register('code_postal')} placeholder="75001" />
                {errors.code_postal && (
                  <p className="text-sm text-destructive">{errors.code_postal.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville *</Label>
                <Input id="ville" {...register('ville')} placeholder="Paris" />
                {errors.ville && (
                  <p className="text-sm text-destructive">{errors.ville.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional info section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Info className="size-4" />
              <span>Informations complementaires</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_lots">Nombre de lots</Label>
                <Input id="nombre_lots" type="number" {...register('nombre_lots')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_immatriculation">N° immatriculation</Label>
                <Input
                  id="numero_immatriculation"
                  {...register('numero_immatriculation')}
                  placeholder="AB1234567"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Building info section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="size-4" />
              <span>Caracteristiques du batiment</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre_batiments">Nombre de batiments</Label>
                <Input id="nombre_batiments" type="number" {...register('nombre_batiments')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_ascenseurs">Nombre d'ascenseurs</Label>
                <Input id="nombre_ascenseurs" type="number" {...register('nombre_ascenseurs')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="periode_construction">Periode de construction</Label>
              <Input id="periode_construction" {...register('periode_construction')} placeholder="ex: 1960-1970" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type_chauffage">Type de chauffage</Label>
                <select
                  id="type_chauffage"
                  {...register('type_chauffage')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">--</option>
                  <option value="individuel">Individuel</option>
                  <option value="collectif">Collectif</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="energie_chauffage">Energie</Label>
                <select
                  id="energie_chauffage"
                  {...register('energie_chauffage')}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">--</option>
                  <option value="gaz">Gaz</option>
                  <option value="electricite">Electricite</option>
                  <option value="fioul">Fioul</option>
                  <option value="bois">Bois</option>
                  <option value="pompe_chaleur">Pompe a chaleur</option>
                  <option value="reseau_chaleur">Reseau de chaleur</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
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
