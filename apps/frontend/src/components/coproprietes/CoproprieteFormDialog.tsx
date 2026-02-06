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
import type { Copropriete } from '@/types'

const coproprieteSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  code_postal: z.string().min(1, 'Le code postal est obligatoire').max(10),
  ville: z.string().min(1, 'La ville est obligatoire'),
  nombre_lots: z.coerce.number().min(0).optional(),
  numero_immatriculation: z.string().optional(),
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
  title = 'Nouvelle copropriété',
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
    },
  })

  const handleFormSubmit = async (data: CoproprieteFormData) => {
    await onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nom">Nom *</Label>
            <Input id="nom" {...register('nom')} placeholder="Résidence Les Tilleuls" />
            {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom.message}</p>}
          </div>

          <div>
            <Label htmlFor="adresse">Adresse *</Label>
            <Input id="adresse" {...register('adresse')} placeholder="12 rue de la Paix" />
            {errors.adresse && <p className="mt-1 text-sm text-red-500">{errors.adresse.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code_postal">Code postal *</Label>
              <Input id="code_postal" {...register('code_postal')} placeholder="75001" />
              {errors.code_postal && <p className="mt-1 text-sm text-red-500">{errors.code_postal.message}</p>}
            </div>
            <div>
              <Label htmlFor="ville">Ville *</Label>
              <Input id="ville" {...register('ville')} placeholder="Paris" />
              {errors.ville && <p className="mt-1 text-sm text-red-500">{errors.ville.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre_lots">Nombre de lots</Label>
              <Input id="nombre_lots" type="number" {...register('nombre_lots')} />
            </div>
            <div>
              <Label htmlFor="numero_immatriculation">N° immatriculation</Label>
              <Input id="numero_immatriculation" {...register('numero_immatriculation')} placeholder="AB1234567" />
            </div>
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
