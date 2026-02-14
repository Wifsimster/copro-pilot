import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Banknote, FileText, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormSection } from '@/components/ui/form-section'
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

  const form = useForm<FormData>({
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
      form.reset({
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
  }, [open, defaultValues, coproprietaireId, appelFondsId, form.reset])

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
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Enregistrez un paiement. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={onFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      {(showCoproSelect || showAppelSelect) && (
        <FormSection icon={Users} label="Attribution">
          {showCoproSelect && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Coproprietaire *</label>
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
            <div className="grid gap-2">
              <label className="text-sm font-medium">Appel de fonds</label>
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
        </FormSection>
      )}

      <FormSection icon={Banknote} label="Paiement">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="montant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant (EUR) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_paiement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode de paiement *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="prelevement">Prelevement</SelectItem>
                    <SelectItem value="especes">Especes</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference</FormLabel>
                <FormControl>
                  <Input placeholder="REF-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Notes">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Notes supplementaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
