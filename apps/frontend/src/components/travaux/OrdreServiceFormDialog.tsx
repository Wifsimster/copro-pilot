import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardList, Banknote, StickyNote } from 'lucide-react'
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
import { usePrestataires } from '@/hooks/usePrestataires'
import { useIncidentsByCopropriete } from '@/hooks/useIncidents'
import type { OrdreService, Incident, Prestataire } from '@/types'

const ordreServiceSchema = z.object({
  objet: z.string().min(1, "L'objet est obligatoire"),
  description: z.string().optional(),
  prestataire_id: z.string().optional(),
  incident_id: z.string().optional(),
  urgence: z.enum(['normale', 'urgente', 'tres_urgente']),
  statut: z.enum(['brouillon', 'emis', 'devis_recu', 'accepte', 'termine', 'annule']),
  montant_estime: z.coerce.number().positive().optional().or(z.literal('')),
  montant_devis: z.coerce.number().positive().optional().or(z.literal('')),
  montant_facture: z.coerce.number().positive().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type OrdreServiceFormData = z.infer<typeof ordreServiceSchema>

interface OrdreServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<OrdreService>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<OrdreService>
  title?: string
}

export function OrdreServiceFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvel ordre de service',
}: OrdreServiceFormDialogProps) {
  const { data: prestataires } = usePrestataires()
  const { data: incidents } = useIncidentsByCopropriete(coproprieteId)

  const form = useForm<OrdreServiceFormData>({
    resolver: zodResolver(ordreServiceSchema),
    defaultValues: {
      objet: defaultValues?.objet || '',
      description: defaultValues?.description || '',
      prestataire_id: defaultValues?.prestataire_id?.toString() || '',
      incident_id: defaultValues?.incident_id?.toString() || '',
      urgence: defaultValues?.urgence || 'normale',
      statut: defaultValues?.statut || 'brouillon',
      montant_estime: defaultValues?.montant_estime ?? '',
      montant_devis: defaultValues?.montant_devis ?? '',
      montant_facture: defaultValues?.montant_facture ?? '',
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: OrdreServiceFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      description: data.description || null,
      prestataire_id: data.prestataire_id ? Number(data.prestataire_id) : null,
      incident_id: data.incident_id ? Number(data.incident_id) : null,
      montant_estime: data.montant_estime === '' ? null : Number(data.montant_estime),
      montant_devis: data.montant_devis === '' ? null : Number(data.montant_devis),
      montant_facture: data.montant_facture === '' ? null : Number(data.montant_facture),
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Creez ou modifiez un ordre de service. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={ClipboardList} label="Informations generales">
        <FormField
          control={form.control}
          name="objet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objet *</FormLabel>
              <FormControl>
                <Input placeholder="Objet de l'ordre de service..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Description detaillee..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prestataire_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prestataire</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {prestataires?.map((p: Prestataire) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.nom}
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionner..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Aucun</SelectItem>
                    {incidents?.map((i: Incident) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="urgence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgence *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="tres_urgente">Tres urgente</SelectItem>
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
                    <SelectItem value="emis">Emis</SelectItem>
                    <SelectItem value="devis_recu">Devis recu</SelectItem>
                    <SelectItem value="accepte">Accepte</SelectItem>
                    <SelectItem value="termine">Termine</SelectItem>
                    <SelectItem value="annule">Annule</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Banknote} label="Montants">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="montant_estime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant estime (EUR)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="1500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
      </FormSection>

      <FormSection icon={StickyNote} label="Notes">
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
