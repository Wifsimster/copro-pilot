import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Euro, FileText } from 'lucide-react'
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
import type { PropositionSyndic } from '@/types'

const propositionSyndicSchema = z.object({
  syndic_nom: z.string().min(1, 'Le nom du syndic est obligatoire'),
  date_reception: z.string().min(1, 'La date de reception est obligatoire'),
  montant_propose: z.coerce.number().optional(),
  prestations_proposees: z.string().optional(),
  document_url: z.string().optional(),
  retenue: z.string(),
  notes: z.string().optional(),
})

type PropositionSyndicFormData = z.infer<typeof propositionSyndicSchema>

interface PropositionSyndicFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<PropositionSyndic>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<PropositionSyndic>
  title?: string
}

export function PropositionSyndicFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle proposition',
}: PropositionSyndicFormDialogProps) {
  const form = useForm<PropositionSyndicFormData>({
    resolver: zodResolver(propositionSyndicSchema),
    defaultValues: {
      syndic_nom: defaultValues?.syndic_nom || '',
      date_reception: defaultValues?.date_reception || new Date().toISOString().slice(0, 10),
      montant_propose: defaultValues?.montant_propose || 0,
      prestations_proposees: defaultValues?.prestations_proposees || '',
      document_url: defaultValues?.document_url || '',
      retenue: defaultValues?.retenue ? 'oui' : 'non',
      notes: defaultValues?.notes || '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        syndic_nom: defaultValues?.syndic_nom || '',
        date_reception: defaultValues?.date_reception || new Date().toISOString().slice(0, 10),
        montant_propose: defaultValues?.montant_propose || 0,
        prestations_proposees: defaultValues?.prestations_proposees || '',
        document_url: defaultValues?.document_url || '',
        retenue: defaultValues?.retenue ? 'oui' : 'non',
        notes: defaultValues?.notes || '',
      })
    }
  }, [open, defaultValues, form])

  const handleFormSubmit = async (data: PropositionSyndicFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      montant_propose: data.montant_propose || null,
      prestations_proposees: data.prestations_proposees || null,
      document_url: data.document_url || null,
      retenue: data.retenue === 'oui',
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Enregistrez une proposition de contrat de syndic pour la mise en concurrence."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Building2} label="Syndic candidat">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="syndic_nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du syndic *</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du cabinet de syndic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_reception"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de reception *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Euro} label="Proposition financiere">
        <FormField
          control={form.control}
          name="montant_propose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant propose (EUR/an)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prestations_proposees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prestations proposees</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Detail des prestations proposees..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={FileText} label="Decision et notes">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="retenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposition retenue</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="non">Non</SelectItem>
                    <SelectItem value="oui">Oui</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="document_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL du document</FormLabel>
                <FormControl>
                  <Input placeholder="Lien vers le document" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
