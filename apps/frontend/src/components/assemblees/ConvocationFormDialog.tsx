import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, FileText } from 'lucide-react'
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
import type { ConvocationAG, ModeEnvoi } from '@/types'

const convocationSchema = z.object({
  mode_envoi: z.enum(['email', 'courrier_recommande', 'les_deux']),
  contenu: z.string().min(1, 'Le contenu est obligatoire'),
  notes: z.string().optional(),
})

type ConvocationFormData = z.infer<typeof convocationSchema>

interface ConvocationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agId: number
  onSubmit: (data: Partial<ConvocationAG>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ConvocationAG>
  title?: string
}

const DEFAULT_TEMPLATE = `Madame, Monsieur,

Nous avons l'honneur de vous convoquer a l'Assemblee Generale de votre copropriete.

Conformement a l'article 9 du decret du 17 mars 1967, nous vous rappelons que vous disposez de la possibilite de vous faire representer par un mandataire de votre choix.

Veuillez trouver ci-joints les documents preparatoires a cette assemblee.

Nous vous prions d'agreer, Madame, Monsieur, l'expression de nos salutations distinguees.

Le Syndic`

export function ConvocationFormDialog({
  open,
  onOpenChange,
  agId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle convocation',
}: ConvocationFormDialogProps) {
  const form = useForm<ConvocationFormData>({
    resolver: zodResolver(convocationSchema),
    defaultValues: {
      mode_envoi: (defaultValues?.mode_envoi as ModeEnvoi) || 'email',
      contenu: defaultValues?.contenu || DEFAULT_TEMPLATE,
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: ConvocationFormData) => {
    await onSubmit({
      ...data,
      ag_id: agId,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Redigez la convocation et choisissez le mode d'envoi."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
    >
      <FormSection icon={Mail} label="Mode d'envoi">
        <FormField
          control={form.control}
          name="mode_envoi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mode d'envoi *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="courrier_recommande">Courrier recommande</SelectItem>
                  <SelectItem value="les_deux">Les deux (email + courrier)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={FileText} label="Contenu de la convocation">
        <FormField
          control={form.control}
          name="contenu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu *</FormLabel>
              <FormControl>
                <Textarea rows={10} placeholder="Texte de la convocation..." {...field} />
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
              <FormLabel>Notes internes</FormLabel>
              <FormControl>
                <Textarea rows={2} placeholder="Notes internes (non envoyees)..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
