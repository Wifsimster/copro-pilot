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
import type { Coproprietaire } from '@/types'

const coproprietaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
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
  title = 'Nouveau copropriétaire',
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
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prénom *</Label>
              <Input id="prenom" {...register('prenom')} placeholder="Jean" />
              {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom.message}</p>}
            </div>
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register('nom')} placeholder="Dupont" />
              {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="jean.dupont@email.com" />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" {...register('telephone')} placeholder="06 12 34 56 78" />
            </div>
          </div>

          <div>
            <Label htmlFor="adresse_correspondance">Adresse de correspondance</Label>
            <Input
              id="adresse_correspondance"
              {...register('adresse_correspondance')}
              placeholder="12 rue de la Paix, 75001 Paris"
            />
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
