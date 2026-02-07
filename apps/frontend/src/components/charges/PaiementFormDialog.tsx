import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, FileText, Users } from 'lucide-react'
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
  appelFondsId?: number
  coproprietaireId?: number
  coproprietaires?: Array<{ id: number; nom: string; prenom: string }>
  appelsFonds?: Array<{ id: number; trimestre: number; annee: number; montant_total: number }>
  onSubmit: (data: Partial<Paiement>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Paiement>
  title?: string
}

export function PaiementFormDialog({
  open, onOpenChange, appelFondsId, coproprietaireId,
  coproprietaires, appelsFonds,
  onSubmit, isLoading, defaultValues, title = 'Nouveau paiement',
}: Props) {
  const [selectedCoproId, setSelectedCoproId] = useState<number>(0)
  const [selectedAppelId, setSelectedAppelId] = useState<number | null>(null)
  const [coproError, setCoproError] = useState('')

  const showCoproSelect = !coproprietaireId && !!coproprietaires
  const showAppelSelect = !appelFondsId && !!appelsFonds

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

  useEffect(() => {
    if (open) {
      reset({
        montant: defaultValues?.montant || 0,
        date_paiement: defaultValues?.date_paiement || new Date().toISOString().split('T')[0],
        mode: (defaultValues?.mode as FormData['mode']) || 'virement',
        reference: defaultValues?.reference || '',
        notes: defaultValues?.notes || '',
      })
      setSelectedCoproId(defaultValues?.coproprietaire_id || coproprietaireId || 0)
      setSelectedAppelId(defaultValues?.appel_fonds_id || appelFondsId || null)
      setCoproError('')
    }
  }, [open, defaultValues, coproprietaireId, appelFondsId, reset])

  const currentMode = watch('mode')

  const onFormSubmit = async (data: FormData) => {
    const finalCoproId = coproprietaireId || selectedCoproId
    if (!finalCoproId) {
      setCoproError('Le coproprietaire est obligatoire')
      return
    }
    setCoproError('')
    await onSubmit({
      ...data,
      coproprietaire_id: finalCoproId,
      appel_fonds_id: appelFondsId || selectedAppelId || null,
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
          {(showCoproSelect || showAppelSelect) && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Users className="size-4" />
                  <span>Attribution</span>
                </div>

                {showCoproSelect && (
                  <div className="space-y-2">
                    <Label>Coproprietaire *</Label>
                    <Select
                      value={selectedCoproId ? String(selectedCoproId) : ''}
                      onValueChange={(val) => { setSelectedCoproId(parseInt(val)); setCoproError('') }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectionner un coproprietaire..." />
                      </SelectTrigger>
                      <SelectContent>
                        {coproprietaires!.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.prenom} {c.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {coproError && (
                      <p className="text-sm text-destructive">{coproError}</p>
                    )}
                  </div>
                )}

                {showAppelSelect && (
                  <div className="space-y-2">
                    <Label>Appel de fonds</Label>
                    <Select
                      value={selectedAppelId ? String(selectedAppelId) : 'none'}
                      onValueChange={(val) => setSelectedAppelId(val === 'none' ? null : parseInt(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Aucun (paiement libre)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun (paiement libre)</SelectItem>
                        {appelsFonds!.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            T{a.trimestre} {a.annee} — {Number(a.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

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
