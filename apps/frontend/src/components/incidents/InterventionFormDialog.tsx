import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Wrench, Banknote } from 'lucide-react'
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
import type { Intervention } from '@/types'

const interventionSchema = z.object({
  description: z.string().min(1, 'La description est obligatoire'),
  prestataire: z.string().optional(),
  statut: z.enum(['en_attente', 'planifiee', 'en_cours', 'terminee', 'annulee']),
  montant_devis: z.coerce.number().positive().optional().or(z.literal('')),
  montant_facture: z.coerce.number().positive().optional().or(z.literal('')),
  date_prevue: z.string().optional(),
  date_realisation: z.string().optional(),
})

type InterventionFormData = z.infer<typeof interventionSchema>

interface InterventionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Intervention>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Intervention>
  title?: string
}

export function InterventionFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle intervention',
}: InterventionFormDialogProps) {
  const form = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      description: defaultValues?.description || '',
      prestataire: defaultValues?.prestataire || '',
      statut: defaultValues?.statut || 'en_attente',
      montant_devis: defaultValues?.montant_devis ?? '',
      montant_facture: defaultValues?.montant_facture ?? '',
      date_prevue: defaultValues?.date_prevue || '',
      date_realisation: defaultValues?.date_realisation || '',
    },
  })

  const handleFormSubmit = async (data: InterventionFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      prestataire: data.prestataire || null,
      montant_devis: data.montant_devis === '' ? null : Number(data.montant_devis),
      montant_facture: data.montant_facture === '' ? null : Number(data.montant_facture),
      date_prevue: data.date_prevue || null,
      date_realisation: data.date_realisation || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Planifiez une intervention. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Wrench} label="Intervention">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Reparation de la fuite..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prestataire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prestataire</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du prestataire..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="statut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="planifiee">Planifiee</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="terminee">Terminee</SelectItem>
                    <SelectItem value="annulee">Annulee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Banknote} label="Devis, facture et planning">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="montant_devis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant devis (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="montant_facture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant facture (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_prevue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date prevue</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_realisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date realisation</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
    </FormDialog>
  )
}
