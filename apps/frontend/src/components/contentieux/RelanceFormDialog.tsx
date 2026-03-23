import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Euro, FileText } from 'lucide-react'
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
import type { Relance } from '@/types'

const relanceSchema = z.object({
  coproprietaire_id: z.coerce.number().min(1, 'Le copropriétaire est obligatoire'),
  type: z.enum(['amiable', 'mise_en_demeure', 'contentieux']),
  date_relance: z.string().min(1, 'La date est obligatoire'),
  montant_du: z.coerce.number().min(0.01, 'Le montant est obligatoire'),
  mode_envoi: z.string().optional(),
  statut: z.enum(['brouillon', 'envoyee', 'accusee_reception', 'sans_effet']),
  notes: z.string().optional(),
})

type RelanceFormData = z.infer<typeof relanceSchema>

interface RelanceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Relance>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Relance>
  title?: string
}

export function RelanceFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle relance',
}: RelanceFormDialogProps) {
  const form = useForm<RelanceFormData>({
    resolver: zodResolver(relanceSchema),
    defaultValues: {
      coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
      type: defaultValues?.type || 'amiable',
      date_relance: defaultValues?.date_relance || new Date().toISOString().split('T')[0],
      montant_du: defaultValues?.montant_du ?? 0,
      mode_envoi: defaultValues?.mode_envoi || '',
      statut: defaultValues?.statut || 'brouillon',
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: RelanceFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      mode_envoi: data.mode_envoi || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Enregistrez une relance pour impayés. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={Mail} label="Relance">
        <FormField
          control={form.control}
          name="coproprietaire_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Copropriétaire ID *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="ID du copropriétaire" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="amiable">Amiable</SelectItem>
                    <SelectItem value="mise_en_demeure">Mise en demeure</SelectItem>
                    <SelectItem value="contentieux">Contentieux</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="brouillon">Brouillon</SelectItem>
                    <SelectItem value="envoyee">Envoyee</SelectItem>
                    <SelectItem value="accusee_reception">Accusee reception</SelectItem>
                    <SelectItem value="sans_effet">Sans effet</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Euro} label="Montant & dates">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="montant_du"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant du (EUR) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1500.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_relance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de relance *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="mode_envoi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode d'envoi</FormLabel>
              <FormControl>
                <Input placeholder="Email, Courrier recommande..." {...field} />
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
                <Textarea rows={3} placeholder="Notes complementaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
