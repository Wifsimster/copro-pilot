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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCoproprietaires } from '@/hooks/useCoproprietaires'
import type { Mutation, TypeMutation } from '@/types'

const schema = z.object({
  type: z.enum(['vente', 'donation', 'succession', 'autre']),
  date_mutation: z.string().min(1, 'La date est obligatoire'),
  ancien_proprietaire_id: z.coerce.number().positive().optional().or(z.literal(0)),
  nouveau_proprietaire_id: z.coerce.number().positive('Le nouveau proprietaire est obligatoire'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lotId: number
  onSubmit: (data: Partial<Mutation>) => Promise<void>
  isLoading?: boolean
}

export function MutationFormDialog({ open, onOpenChange, lotId, onSubmit, isLoading }: Props) {
  const { data: coproprietaires } = useCoproprietaires()
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'vente',
      date_mutation: new Date().toISOString().split('T')[0],
      ancien_proprietaire_id: 0,
      nouveau_proprietaire_id: 0,
      notes: '',
    },
  })

  const currentType = watch('type')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      lot_id: lotId,
      type: data.type as TypeMutation,
      date_mutation: data.date_mutation,
      ancien_proprietaire_id: data.ancien_proprietaire_id && data.ancien_proprietaire_id > 0 ? data.ancien_proprietaire_id : null,
      nouveau_proprietaire_id: data.nouveau_proprietaire_id,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle mutation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={currentType} onValueChange={(val) => setValue('type', val as FormData['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vente">Vente</SelectItem>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="succession">Succession</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_mutation">Date *</Label>
              <Input id="date_mutation" type="date" {...register('date_mutation')} />
              {errors.date_mutation && <p className="mt-1 text-sm text-red-500">{errors.date_mutation.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="ancien_proprietaire_id">Ancien proprietaire</Label>
            <select
              {...register('ancien_proprietaire_id')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            >
              <option value={0}>— Aucun —</option>
              {coproprietaires?.map((c) => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="nouveau_proprietaire_id">Nouveau proprietaire *</Label>
            <select
              {...register('nouveau_proprietaire_id')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            >
              <option value={0}>— Selectionner —</option>
              {coproprietaires?.map((c) => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
            {errors.nouveau_proprietaire_id && <p className="mt-1 text-sm text-red-500">{errors.nouveau_proprietaire_id.message}</p>}
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} placeholder="Informations complementaires..." />
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
