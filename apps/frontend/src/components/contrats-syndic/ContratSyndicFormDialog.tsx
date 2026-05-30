import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileSignature, CalendarDays, Euro, FileText } from 'lucide-react'
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
import type { ContratSyndic } from '@/types'

const contratSyndicSchema = z.object({
  syndic_nom: z.string().min(1, 'Le nom du syndic est obligatoire'),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().min(1, 'La date de fin est obligatoire'),
  remuneration_forfait: z.coerce.number().optional(),
  prestations_incluses: z.string().optional(),
  prestations_particulieres: z.string().optional(),
  conditions_execution: z.string().optional(),
  statut: z.enum(['en_cours', 'expire', 'resilie', 'en_attente']),
  ag_designation_id: z.coerce.number().optional(),
  notes: z.string().optional(),
})

type ContratSyndicFormData = z.infer<typeof contratSyndicSchema>

interface ContratSyndicFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<ContratSyndic>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ContratSyndic>
  title?: string
}

export function ContratSyndicFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau contrat de syndic',
}: ContratSyndicFormDialogProps) {
  const form = useForm<ContratSyndicFormData>({
    resolver: zodResolver(contratSyndicSchema),
    values: {
      syndic_nom: defaultValues?.syndic_nom || '',
      date_debut: defaultValues?.date_debut || new Date().toISOString().slice(0, 10),
      date_fin: defaultValues?.date_fin || '',
      remuneration_forfait: defaultValues?.remuneration_forfait || 0,
      prestations_incluses: defaultValues?.prestations_incluses || '',
      prestations_particulieres: defaultValues?.prestations_particulieres || '',
      conditions_execution: defaultValues?.conditions_execution || '',
      statut: defaultValues?.statut || 'en_cours',
      ag_designation_id: defaultValues?.ag_designation_id || 0,
      notes: defaultValues?.notes || '',
    },
  })

  
  const handleFormSubmit = async (data: ContratSyndicFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      remuneration_forfait: data.remuneration_forfait || null,
      prestations_incluses: data.prestations_incluses || null,
      prestations_particulieres: data.prestations_particulieres || null,
      conditions_execution: data.conditions_execution || null,
      ag_designation_id: data.ag_designation_id || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Definissez les informations du contrat de syndic. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={FileSignature} label="Syndic">
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
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="expire">Expire</SelectItem>
                    <SelectItem value="resilie">Resilie</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={CalendarDays} label="Duree du mandat">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_debut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de debut *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Euro} label="Remuneration">
        <FormField
          control={form.control}
          name="remuneration_forfait"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Forfait annuel (EUR)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prestations_incluses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prestations incluses dans le forfait</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Gestion courante, convocations AG..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prestations_particulieres"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prestations particulieres (hors forfait)</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Travaux exceptionnels, contentieux..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={FileText} label="Conditions et notes">
        <FormField
          control={form.control}
          name="conditions_execution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conditions d'execution</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Conditions d'execution de la mission..." {...field} />
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
