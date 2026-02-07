import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, FileText } from 'lucide-react'
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
  defaultValues?: Partial<Paiement>
  title?: string
}

export function PaiementFormDialog({ open, onOpenChange, appelFondsId, coproprietaireId, onSubmit, isLoading, defaultValues, title = 'Nouveau paiement' }: Props) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      montant: defaultValues?.montant || 0,
      date_paiement: defaultValues?.date_paiement || new Date().toISOString().split('T')[0],
      mode: (defaultValues?.mode as FormData['mode']) || 'virement',
      reference: defaultValues?.reference || '',
      notes: defaultValues?.notes || '',
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Enregistrez un paiement. Les champs marques d'un * sont obligatoires.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Payment details section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Banknote className="size-4" />
              <span>Paiement</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="montant">Montant (EUR) *</Label>
                <Input id="montant" type="number" step="0.01" {...register('montant')} />
                {errors.montant && (
                  <p className="text-sm text-destructive">{errors.montant.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_paiement">Date *</Label>
                <Input id="date_paiement" type="date" {...register('date_paiement')} />
                {errors.date_paiement && (
                  <p className="text-sm text-destructive">{errors.date_paiement.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input id="reference" {...register('reference')} placeholder="REF-001" />
              </div>
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
