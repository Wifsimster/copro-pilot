import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileWarning, CalendarDays, Banknote, FileText } from 'lucide-react'
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
import type { Sinistre, Assurance, Incident } from '@/types'

const sinistreSchema = z.object({
  assurance_id: z.string().optional(),
  incident_id: z.string().optional(),
  numero_sinistre: z.string().optional(),
  date_sinistre: z.string().min(1, 'La date du sinistre est obligatoire'),
  date_declaration: z.string().optional(),
  description: z.string().optional(),
  montant_estime: z.string().optional(),
  montant_indemnise: z.string().optional(),
  statut: z.enum(['declare', 'en_instruction', 'accepte', 'refuse', 'clos']),
  notes: z.string().optional(),
})

type SinistreFormData = z.infer<typeof sinistreSchema>

interface SinistreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Sinistre>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Sinistre>
  title?: string
  assurances?: Assurance[]
  incidents?: Incident[]
}

export function SinistreFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Declarer un sinistre',
  assurances = [],
  incidents = [],
}: SinistreFormDialogProps) {
  const form = useForm<SinistreFormData>({
    resolver: zodResolver(sinistreSchema),
    defaultValues: {
      assurance_id: defaultValues?.assurance_id ? String(defaultValues.assurance_id) : '',
      incident_id: defaultValues?.incident_id ? String(defaultValues.incident_id) : '',
      numero_sinistre: defaultValues?.numero_sinistre || '',
      date_sinistre: defaultValues?.date_sinistre || new Date().toISOString().split('T')[0],
      date_declaration: defaultValues?.date_declaration || '',
      description: defaultValues?.description || '',
      montant_estime: defaultValues?.montant_estime != null ? String(defaultValues.montant_estime) : '',
      montant_indemnise: defaultValues?.montant_indemnise != null ? String(defaultValues.montant_indemnise) : '',
      statut: defaultValues?.statut || 'declare',
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: SinistreFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      assurance_id: data.assurance_id ? parseInt(data.assurance_id) : null,
      incident_id: data.incident_id ? parseInt(data.incident_id) : null,
      numero_sinistre: data.numero_sinistre || null,
      date_declaration: data.date_declaration || null,
      description: data.description || null,
      montant_estime: data.montant_estime ? parseFloat(data.montant_estime) : null,
      montant_indemnise: data.montant_indemnise ? parseFloat(data.montant_indemnise) : null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations du sinistre. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={FileWarning} label="Informations du sinistre">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero_sinistre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero de sinistre</FormLabel>
                <FormControl>
                  <Input placeholder="SIN-2025-00001" {...field} />
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
                    <SelectItem value="declare">Declare</SelectItem>
                    <SelectItem value="en_instruction">En instruction</SelectItem>
                    <SelectItem value="accepte">Accepte</SelectItem>
                    <SelectItem value="refuse">Refuse</SelectItem>
                    <SelectItem value="clos">Clos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Description du sinistre..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assurance_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assurance liee</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucune</SelectItem>
                    {assurances.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.compagnie} — {a.numero_police || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="incident_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident lie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {incidents.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.titre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={CalendarDays} label="Dates">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_sinistre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date du sinistre *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_declaration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de declaration</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Banknote} label="Montants">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="montant_estime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant estime</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="montant_indemnise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant indemnise</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                <Textarea rows={3} placeholder="Informations complementaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
