import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Vote, FileText } from 'lucide-react'
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
import type { Resolution, TypeMajorite } from '@/types'
import {  } from 'react'

const schema = z.object({
  titre: z.string().min(1, 'Le titre est obligatoire'),
  description: z.string().optional(),
  majorite: z.enum(['article_24', 'article_25', 'article_26', 'unanimite']),
  voix_pour: z.coerce.number().min(0).optional(),
  voix_contre: z.coerce.number().min(0).optional(),
  abstentions: z.coerce.number().min(0).optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  agId: number
  numero: number
  onSubmit: (data: Partial<Resolution>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Resolution>
  title?: string
}

export function ResolutionFormDialog({ open, onOpenChange, agId, numero, onSubmit, isLoading, defaultValues, title }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      titre: defaultValues?.titre ?? '',
      description: defaultValues?.description ?? '',
      majorite: defaultValues?.majorite ?? 'article_24',
      voix_pour: defaultValues?.voix_pour ?? 0,
      voix_contre: defaultValues?.voix_contre ?? 0,
      abstentions: defaultValues?.abstentions ?? 0,
    },
  })

  
  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      ag_id: agId,
      numero: defaultValues?.numero ?? numero,
      titre: data.titre,
      description: data.description || null,
      majorite: data.majorite as TypeMajorite,
      voix_pour: data.voix_pour ?? 0,
      voix_contre: data.voix_contre ?? 0,
      abstentions: data.abstentions ?? 0,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? `Résolution #${defaultValues?.numero ?? numero}`}
      description="Ajoutez une résolution à l'ordre du jour. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={onFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={FileText} label="Contenu">
        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Approbation des comptes..." {...field} />
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
                <Textarea rows={3} placeholder="Details de la resolution..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={Vote} label="Regles de vote">
        <FormField
          control={form.control}
          name="majorite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Majorite requise *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="article_24">Article 24 (majorite simple)</SelectItem>
                  <SelectItem value="article_25">Article 25 (majorite absolue)</SelectItem>
                  <SelectItem value="article_26">Article 26 (double majorite)</SelectItem>
                  <SelectItem value="unanimite">Unanimite</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="voix_pour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voix pour</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="voix_contre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voix contre</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="abstentions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abstentions</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
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
