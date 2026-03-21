import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardCheck, Tag } from 'lucide-react'
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
import type { Tache } from '@/types'

const tacheSchema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  date_echeance: z.string().optional(),
  priorite: z.enum(['basse', 'normale', 'haute', 'urgente']),
  statut: z.enum(['a_faire', 'en_cours', 'fait', 'annule']),
})

type TacheFormData = z.infer<typeof tacheSchema>

interface TacheFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId?: number
  onSubmit: (data: Partial<Tache>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Tache>
  title?: string
}

export function TacheFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle tache',
}: TacheFormDialogProps) {
  const form = useForm<TacheFormData>({
    resolver: zodResolver(tacheSchema),
    defaultValues: {
      titre: defaultValues?.titre || '',
      description: defaultValues?.description || '',
      date_echeance: defaultValues?.date_echeance || '',
      priorite: defaultValues?.priorite || 'normale',
      statut: defaultValues?.statut || 'a_faire',
    },
  })

  const handleFormSubmit = async (data: TacheFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId || null,
      description: data.description || null,
      date_echeance: data.date_echeance || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations de la tache. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={ClipboardCheck} label="Informations">
        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Envoyer convocation AG..."
                  {...field}
                />
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
                <Textarea
                  rows={3}
                  placeholder="Details de la tache..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={Tag} label="Parametres">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priorite"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorite *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basse">Basse</SelectItem>
                    <SelectItem value="normale">Normale</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="a_faire">A faire</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="fait">Fait</SelectItem>
                    <SelectItem value="annule">Annule</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="date_echeance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date d'echeance</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
