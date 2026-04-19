import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  URGENCE_INCIDENT,
  STATUT_INCIDENT,
} from '@copro-pilot/shared-enums'
import { AlertTriangle, Tag } from 'lucide-react'
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
import type { Incident } from '@/types'

const incidentSchema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  categorie: z.string().optional(),
  urgence: z.enum(URGENCE_INCIDENT),
  statut: z.enum(STATUT_INCIDENT),
  date_signalement: z.string().min(1, 'La date est obligatoire'),
})

type IncidentFormData = z.infer<typeof incidentSchema>

interface IncidentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Incident>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Incident>
  title?: string
}

export function IncidentFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Signaler un incident',
}: IncidentFormDialogProps) {
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      titre: defaultValues?.titre || '',
      description: defaultValues?.description || '',
      categorie: defaultValues?.categorie || '',
      urgence: defaultValues?.urgence || 'moyenne',
      statut: defaultValues?.statut || 'ouvert',
      date_signalement: defaultValues?.date_signalement || new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        titre: defaultValues?.titre || '',
        description: defaultValues?.description || '',
        categorie: defaultValues?.categorie || '',
        urgence: defaultValues?.urgence || 'moyenne',
        statut: defaultValues?.statut || 'ouvert',
        date_signalement: defaultValues?.date_signalement || new Date().toISOString().split('T')[0],
      })
    }
  }, [open, defaultValues, form])

  const handleFormSubmit = async (data: IncidentFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      description: data.description || null,
      categorie: data.categorie || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Decrivez l'incident rencontre. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={AlertTriangle} label="Description de l'incident">
        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Fuite d'eau au 3e etage..." {...field} />
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
                <Textarea rows={3} placeholder="Details de l'incident..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={Tag} label="Classification">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="categorie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categorie</FormLabel>
                <FormControl>
                  <Input placeholder="Plomberie, Electricite..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    <SelectItem value="faible">Faible</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="critique">Critique</SelectItem>
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
                    <SelectItem value="ouvert">Ouvert</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="resolu">Resolu</SelectItem>
                    <SelectItem value="ferme">Ferme</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_signalement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de signalement *</FormLabel>
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
