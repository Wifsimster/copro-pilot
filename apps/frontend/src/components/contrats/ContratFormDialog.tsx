import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, CalendarDays, Shield } from 'lucide-react'
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
import type { Contrat, Prestataire } from '@/types'

const contratSchema = z.object({
  prestataire_id: z.coerce.number().min(1, 'Le prestataire est obligatoire'),
  objet: z.string().min(1, 'L\'objet est obligatoire'),
  type: z.string().optional(),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().optional(),
  montant_annuel: z.coerce.number().optional(),
  frequence_paiement: z.enum(['mensuel', 'trimestriel', 'semestriel', 'annuel']),
  preavis_mois: z.coerce.number().optional(),
  reconduction_tacite: z.boolean(),
  conditions_resiliation: z.string().optional(),
  statut: z.enum(['actif', 'expire', 'resilie', 'en_attente']),
  notes: z.string().optional(),
})

type ContratFormData = z.infer<typeof contratSchema>

interface ContratFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  prestataires: Prestataire[]
  onSubmit: (data: Partial<Contrat>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Contrat>
  title?: string
}

export function ContratFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  prestataires,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau contrat',
}: ContratFormDialogProps) {
  const form = useForm<ContratFormData>({
    resolver: zodResolver(contratSchema),
    values: {
      prestataire_id: defaultValues?.prestataire_id || 0,
      objet: defaultValues?.objet || '',
      type: defaultValues?.type || '',
      date_debut: defaultValues?.date_debut || new Date().toISOString().slice(0, 10),
      date_fin: defaultValues?.date_fin || '',
      montant_annuel: defaultValues?.montant_annuel || 0,
      frequence_paiement: defaultValues?.frequence_paiement || 'annuel',
      preavis_mois: defaultValues?.preavis_mois || 0,
      reconduction_tacite: defaultValues?.reconduction_tacite ?? true,
      conditions_resiliation: defaultValues?.conditions_resiliation || '',
      statut: defaultValues?.statut || 'actif',
      notes: defaultValues?.notes || '',
    },
  })

  
  const handleFormSubmit = async (data: ContratFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      type: data.type || null,
      date_fin: data.date_fin || null,
      montant_annuel: data.montant_annuel || null,
      preavis_mois: data.preavis_mois || null,
      conditions_resiliation: data.conditions_resiliation || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Definissez les informations du contrat. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={FileText} label="Contrat">
        <FormField
          control={form.control}
          name="prestataire_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prestataire *</FormLabel>
              <Select
                value={field.value ? String(field.value) : ''}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez un prestataire" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {prestataires.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nom}{p.specialite ? ` - ${p.specialite}` : ''}
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
          name="objet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objet *</FormLabel>
              <FormControl>
                <Input placeholder="Objet du contrat" {...field} />
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
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionnez un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="entretien">Entretien</SelectItem>
                    <SelectItem value="gardiennage">Gardiennage</SelectItem>
                    <SelectItem value="assurance">Assurance</SelectItem>
                    <SelectItem value="nettoyage">Nettoyage</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
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
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="expire">Expire</SelectItem>
                    <SelectItem value="resilie">Resilie</SelectItem>
                    <SelectItem value="en_attente">En attente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={CalendarDays} label="Dates et montant">
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
                <FormLabel>Date de fin</FormLabel>
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
            name="montant_annuel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant annuel (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frequence_paiement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequence de paiement *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="trimestriel">Trimestriel</SelectItem>
                    <SelectItem value="semestriel">Semestriel</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Shield} label="Conditions">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preavis_mois"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preavis (mois)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reconduction_tacite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reconduction tacite</FormLabel>
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
          name="conditions_resiliation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conditions de resiliation</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Conditions de resiliation..." {...field} />
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
