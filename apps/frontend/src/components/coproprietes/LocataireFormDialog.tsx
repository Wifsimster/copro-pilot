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
import type { Locataire } from '@/types'

const schema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prenom est obligatoire'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  date_entree: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lotId: number
  onSubmit: (data: Partial<Locataire>) => Promise<void>
  isLoading?: boolean
}

export function LocataireFormDialog({ open, onOpenChange, lotId, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nom: '', prenom: '', email: '', telephone: '', date_entree: '' },
  })

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      lot_id: lotId,
      email: data.email || null,
      telephone: data.telephone || null,
      date_entree: data.date_entree || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau locataire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prenom *</Label>
              <Input id="prenom" {...register('prenom')} />
              {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom.message}</p>}
            </div>
            <div>
              <Label htmlFor="nom">Nom *</Label>
              <Input id="nom" {...register('nom')} />
              {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="telephone">Telephone</Label>
              <Input id="telephone" {...register('telephone')} />
            </div>
          </div>
          <div>
            <Label htmlFor="date_entree">Date d'entree</Label>
            <Input id="date_entree" type="date" {...register('date_entree')} />
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
