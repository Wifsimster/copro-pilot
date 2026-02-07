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
import type { Paiement } from '@/types'

const schema = z.object({
  montant: z.coerce.number().positive('Le montant doit etre positif'),
  date_paiement: z.string().min(1, 'La date est obligatoire'),
  mode: z.enum(['virement', 'cheque', 'prelevement', 'especes', 'autre']),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  appelFondsId: number
  coproprietaireId: number
  onSubmit: (data: Partial<Paiement>) => Promise<void>
  isLoading?: boolean
}

export function PaiementFormDialog({ open, onOpenChange, appelFondsId, coproprietaireId, onSubmit, isLoading }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      montant: 0,
      date_paiement: new Date().toISOString().split('T')[0],
      mode: 'virement',
      reference: '',
      notes: '',
    },
  })

  const currentMode = watch('mode')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      appel_fonds_id: appelFondsId,
      coproprietaire_id: coproprietaireId,
      reference: data.reference || null,
      notes: data.notes || null,
    })
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau paiement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="montant">Montant (EUR) *</Label>
              <Input id="montant" type="number" step="0.01" {...register('montant')} />
              {errors.montant && <p className="mt-1 text-sm text-red-500">{errors.montant.message}</p>}
            </div>
            <div>
              <Label htmlFor="date_paiement">Date *</Label>
              <Input id="date_paiement" type="date" {...register('date_paiement')} />
              {errors.date_paiement && <p className="mt-1 text-sm text-red-500">{errors.date_paiement.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mode">Mode de paiement *</Label>
              <Select value={currentMode} onValueChange={(val) => setValue('mode', val as FormData['mode'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="virement">Virement</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="prelevement">Prelevement</SelectItem>
                  <SelectItem value="especes">Especes</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" {...register('reference')} placeholder="REF-001" />
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" {...register('notes')} />
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
