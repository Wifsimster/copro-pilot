import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scale, Gavel, CalendarDays, Euro, FileText } from 'lucide-react'
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
import type { Procedure } from '@/types'

const procedureSchema = z.object({
  coproprietaire_id: z.coerce.number().min(1, 'Le coproprietaire est obligatoire'),
  avocat: z.string().optional(),
  tribunal: z.string().optional(),
  reference_dossier: z.string().optional(),
  date_assignation: z.string().optional(),
  date_audience: z.string().optional(),
  date_jugement: z.string().optional(),
  montant_reclame: z.coerce.number().positive().optional().or(z.literal(0)),
  montant_obtenu: z.coerce.number().positive().optional().or(z.literal(0)),
  frais_procedure: z.coerce.number().positive().optional().or(z.literal(0)),
  statut: z.enum(['en_preparation', 'en_cours', 'audience_fixee', 'juge', 'execute', 'clos']),
  decision: z.string().optional(),
  notes: z.string().optional(),
})

type ProcedureFormData = z.infer<typeof procedureSchema>

interface ProcedureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Procedure>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Procedure>
  title?: string
}

export function ProcedureFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle procedure',
}: ProcedureFormDialogProps) {
  const form = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureSchema),
    defaultValues: {
      coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
      avocat: defaultValues?.avocat || '',
      tribunal: defaultValues?.tribunal || '',
      reference_dossier: defaultValues?.reference_dossier || '',
      date_assignation: defaultValues?.date_assignation || '',
      date_audience: defaultValues?.date_audience || '',
      date_jugement: defaultValues?.date_jugement || '',
      montant_reclame: defaultValues?.montant_reclame ?? 0,
      montant_obtenu: defaultValues?.montant_obtenu ?? 0,
      frais_procedure: defaultValues?.frais_procedure ?? 0,
      statut: defaultValues?.statut || 'en_preparation',
      decision: defaultValues?.decision || '',
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: ProcedureFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      avocat: data.avocat || null,
      tribunal: data.tribunal || null,
      reference_dossier: data.reference_dossier || null,
      date_assignation: data.date_assignation || null,
      date_audience: data.date_audience || null,
      date_jugement: data.date_jugement || null,
      montant_reclame: data.montant_reclame ? Number(data.montant_reclame) : null,
      montant_obtenu: data.montant_obtenu ? Number(data.montant_obtenu) : null,
      frais_procedure: data.frais_procedure ? Number(data.frais_procedure) : null,
      decision: data.decision || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Enregistrez une procedure judiciaire. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Scale} label="Procedure">
        <FormField
          control={form.control}
          name="coproprietaire_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coproprietaire ID *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="ID du coproprietaire" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
                    <SelectItem value="en_preparation">En preparation</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="audience_fixee">Audience fixee</SelectItem>
                    <SelectItem value="juge">Juge</SelectItem>
                    <SelectItem value="execute">Execute</SelectItem>
                    <SelectItem value="clos">Clos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reference_dossier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference dossier</FormLabel>
                <FormControl>
                  <Input placeholder="REF-2026-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Gavel} label="Intervenants">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="avocat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avocat</FormLabel>
                <FormControl>
                  <Input placeholder="Me Dupont..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tribunal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tribunal</FormLabel>
                <FormControl>
                  <Input placeholder="TJ Paris..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={CalendarDays} label="Dates">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="date_assignation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assignation</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_audience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audience</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_jugement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jugement</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Euro} label="Montants">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="montant_reclame"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reclame (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="montant_obtenu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obtenu (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="4500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frais_procedure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frais (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="800" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Decision & notes">
        <FormField
          control={form.control}
          name="decision"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decision</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Decision du tribunal..." {...field} />
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
