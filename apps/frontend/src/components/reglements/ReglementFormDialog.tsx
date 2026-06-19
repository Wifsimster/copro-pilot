import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BookOpen, CalendarDays, FileText } from 'lucide-react'
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
import type { ReglementCopropriete } from '@/types'

const reglementSchema = z.object({
  date_etablissement: z.string().min(1, 'La date est obligatoire'),
  date_derniere_modification: z.string().optional(),
  notaire: z.string().optional(),
  destination_immeuble: z.enum(['habitation', 'commerce', 'mixte']),
  restrictions_usage: z.string().optional(),
  conditions_travaux: z.string().optional(),
  composition_conseil_syndical: z.string().optional(),
  modalites_convocation_ag: z.string().optional(),
  document_url: z.string().optional(),
  notes: z.string().optional(),
})

type ReglementFormData = z.infer<typeof reglementSchema>

interface ReglementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<ReglementCopropriete>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ReglementCopropriete>
  title?: string
}

export function ReglementFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau règlement',
}: ReglementFormDialogProps) {
  const form = useForm<ReglementFormData>({
    resolver: zodResolver(reglementSchema),
    defaultValues: {
      date_etablissement: defaultValues?.date_etablissement || new Date().toISOString().split('T')[0],
      date_derniere_modification: defaultValues?.date_derniere_modification || '',
      notaire: defaultValues?.notaire || '',
      destination_immeuble: defaultValues?.destination_immeuble || 'habitation',
      restrictions_usage: defaultValues?.restrictions_usage || '',
      conditions_travaux: defaultValues?.conditions_travaux || '',
      composition_conseil_syndical: defaultValues?.composition_conseil_syndical || '',
      modalites_convocation_ag: defaultValues?.modalites_convocation_ag || '',
      document_url: defaultValues?.document_url || '',
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: ReglementFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_derniere_modification: data.date_derniere_modification || null,
      notaire: data.notaire || null,
      restrictions_usage: data.restrictions_usage || null,
      conditions_travaux: data.conditions_travaux || null,
      composition_conseil_syndical: data.composition_conseil_syndical || null,
      modalites_convocation_ag: data.modalites_convocation_ag || null,
      document_url: data.document_url || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations du règlement de copropriété. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={BookOpen} label="Informations générales">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_etablissement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'établissement *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_derniere_modification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dernière modification</FormLabel>
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
            name="notaire"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notaire</FormLabel>
                <FormControl>
                  <Input placeholder="Me Dupont..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination_immeuble"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="habitation">Habitation</SelectItem>
                    <SelectItem value="commerce">Commerce</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Clauses et conditions">
        <FormField
          control={form.control}
          name="restrictions_usage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restrictions d'usage</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Restrictions d'usage des parties privatives..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="conditions_travaux"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conditions de travaux</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Conditions pour la réalisation de travaux..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="composition_conseil_syndical"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Composition du conseil syndical</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Composition et règles du conseil syndical..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modalites_convocation_ag"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalités de convocation AG</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Modalités de convocation des assemblées générales..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={CalendarDays} label="Document et notes">
        <FormField
          control={form.control}
          name="document_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL du document</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Notes complémentaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
