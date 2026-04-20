import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowDownUp, FileText } from 'lucide-react'
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
import type { MouvementBancaire } from '@/types'

const mouvementSchema = z.object({
  date: z.string().min(1, 'La date est obligatoire'),
  libelle: z.string().min(1, 'Le libellé est obligatoire'),
  montant: z.coerce.number().positive('Le montant doit être positif'),
  type: z.enum(['credit', 'debit']),
  categorie: z.string().optional(),
  reference: z.string().optional(),
  rapproche: z.boolean(),
  notes: z.string().optional(),
})

type MouvementFormData = z.infer<typeof mouvementSchema>

interface MouvementBancaireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  compteId: number
  onSubmit: (data: Partial<MouvementBancaire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<MouvementBancaire>
  title?: string
}

export function MouvementBancaireFormDialog({
  open,
  onOpenChange,
  compteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau mouvement',
}: MouvementBancaireFormDialogProps) {
  const form = useForm<MouvementFormData>({
    resolver: zodResolver(mouvementSchema),
    defaultValues: {
      date: defaultValues?.date || new Date().toISOString().split('T')[0],
      libelle: defaultValues?.libelle || '',
      montant: defaultValues?.montant || 0,
      type: defaultValues?.type || 'credit',
      categorie: defaultValues?.categorie || '',
      reference: defaultValues?.reference || '',
      rapproche: defaultValues?.rapproche || false,
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: MouvementFormData) => {
    await onSubmit({
      ...data,
      compte_id: compteId,
      categorie: data.categorie || null,
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
      description="Enregistrez un mouvement bancaire. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={ArrowDownUp} label="Mouvement">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
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
          <FormField
            control={form.control}
            name="montant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant (EUR) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="libelle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Libelle *</FormLabel>
                <FormControl>
                  <Input placeholder="Libelle du mouvement" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="credit">Credit</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Details">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categorie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner une categorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="appel_de_fonds">Appel de fonds</SelectItem>
                    <SelectItem value="paiement_prestataire">Paiement prestataire</SelectItem>
                    <SelectItem value="frais_bancaires">Frais bancaires</SelectItem>
                    <SelectItem value="remboursement">Remboursement</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rapproche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rapproche</FormLabel>
                <Select value={field.value ? 'true' : 'false'} onValueChange={(val) => field.onChange(val === 'true')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Oui</SelectItem>
                    <SelectItem value="false">Non</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference</FormLabel>
              <FormControl>
                <Input placeholder="Reference du mouvement" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
