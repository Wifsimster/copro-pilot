import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardCheck, CalendarDays, FileText } from 'lucide-react'
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
import type { Diagnostic } from '@/types'

const diagnosticSchema = z.object({
  type: z.enum(['dpe', 'amiante', 'plomb', 'dtg', 'ppt', 'gaz', 'electricite', 'autre']),
  prestataire: z.string().optional(),
  date_realisation: z.string().min(1, 'La date de realisation est obligatoire'),
  date_validite: z.string().optional(),
  statut: z.enum(['valide', 'expire', 'a_renouveler']),
  document_url: z.string().optional(),
  observations: z.string().optional(),
})

type DiagnosticFormData = z.infer<typeof diagnosticSchema>

interface DiagnosticFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Diagnostic>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Diagnostic>
  title?: string
}

const TYPE_LABELS: Record<string, string> = {
  dpe: 'DPE',
  amiante: 'Amiante',
  plomb: 'Plomb',
  dtg: 'DTG',
  ppt: 'PPT',
  gaz: 'Gaz',
  electricite: 'Electricite',
  autre: 'Autre',
}

const STATUT_LABELS: Record<string, string> = {
  valide: 'Valide',
  expire: 'Expire',
  a_renouveler: 'A renouveler',
}

export function DiagnosticFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau diagnostic',
}: DiagnosticFormDialogProps) {
  const form = useForm<DiagnosticFormData>({
    resolver: zodResolver(diagnosticSchema),
    defaultValues: {
      type: defaultValues?.type || 'dpe',
      prestataire: defaultValues?.prestataire || '',
      date_realisation: defaultValues?.date_realisation || new Date().toISOString().split('T')[0],
      date_validite: defaultValues?.date_validite || '',
      statut: defaultValues?.statut || 'valide',
      document_url: defaultValues?.document_url || '',
      observations: defaultValues?.observations || '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        type: defaultValues?.type || 'dpe',
        prestataire: defaultValues?.prestataire || '',
        date_realisation: defaultValues?.date_realisation || new Date().toISOString().split('T')[0],
        date_validite: defaultValues?.date_validite || '',
        statut: defaultValues?.statut || 'valide',
        document_url: defaultValues?.document_url || '',
        observations: defaultValues?.observations || '',
      })
    }
  }, [open, defaultValues, form.reset])

  const handleFormSubmit = async (data: DiagnosticFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      prestataire: data.prestataire || null,
      date_validite: data.date_validite || null,
      document_url: data.document_url || null,
      observations: data.observations || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations du diagnostic technique. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={ClipboardCheck} label="Type et statut">
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
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
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
                    {Object.entries(STATUT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
      </FormSection>

      <FormSection icon={CalendarDays} label="Dates">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_realisation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de realisation *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_validite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de validite</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Details">
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
          name="observations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observations</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Observations..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
