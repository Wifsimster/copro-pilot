import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Landmark, FileText } from 'lucide-react'
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
import type { CompteBancaire } from '@/types'

const compteBancaireSchema = z.object({
  banque: z.string().min(1, 'La banque est obligatoire'),
  iban: z.string().min(1, 'L\'IBAN est obligatoire').max(34),
  bic: z.string().optional(),
  type: z.enum(['courant', 'fonds_travaux', 'emprunt']),
  libelle: z.string().optional(),
  solde: z.coerce.number(),
  date_ouverture: z.string().optional(),
  actif: z.boolean(),
  notes: z.string().optional(),
})

type CompteBancaireFormData = z.infer<typeof compteBancaireSchema>

interface CompteBancaireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<CompteBancaire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<CompteBancaire>
  title?: string
}

export function CompteBancaireFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau compte bancaire',
}: CompteBancaireFormDialogProps) {
  const form = useForm<CompteBancaireFormData>({
    resolver: zodResolver(compteBancaireSchema),
    defaultValues: {
      banque: defaultValues?.banque || '',
      iban: defaultValues?.iban || '',
      bic: defaultValues?.bic || '',
      type: defaultValues?.type || 'courant',
      libelle: defaultValues?.libelle || '',
      solde: defaultValues?.solde || 0,
      date_ouverture: defaultValues?.date_ouverture || '',
      actif: defaultValues?.actif ?? true,
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: CompteBancaireFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      bic: data.bic || null,
      libelle: data.libelle || null,
      date_ouverture: data.date_ouverture || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations du compte bancaire. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Landmark} label="Informations bancaires">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="banque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banque *</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de la banque" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN *</FormLabel>
                <FormControl>
                  <Input placeholder="FR76 ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="bic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BIC</FormLabel>
                <FormControl>
                  <Input placeholder="BNPAFRPP" {...field} />
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
                    <SelectItem value="courant">Courant</SelectItem>
                    <SelectItem value="fonds_travaux">Fonds travaux</SelectItem>
                    <SelectItem value="emprunt">Emprunt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Parametres">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="libelle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Libellé</FormLabel>
                <FormControl>
                  <Input placeholder="Libellé du compte" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="solde"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solde (EUR) *</FormLabel>
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
            name="date_ouverture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'ouverture</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="actif"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut *</FormLabel>
                <Select value={field.value ? 'true' : 'false'} onValueChange={(val) => field.onChange(val === 'true')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
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
