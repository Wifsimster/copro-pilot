import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ListOrdered, FileText } from 'lucide-react'
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
import type { ArticleReglement } from '@/types'

const articleSchema = z.object({
  numero: z.string().min(1, 'Le numéro est obligatoire'),
  titre: z.string().min(1, 'Le titre est obligatoire'),
  contenu: z.string().optional(),
  categorie: z.enum(['parties_privatives', 'parties_communes', 'charges', 'usage', 'travaux', 'conseil_syndical', 'ag', 'autre']),
  ordre: z.coerce.number().int().min(0),
  notes: z.string().optional(),
})

type ArticleFormData = z.infer<typeof articleSchema>

interface ArticleReglementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reglementId: number
  onSubmit: (data: Partial<ArticleReglement>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<ArticleReglement>
  title?: string
}

export function ArticleReglementFormDialog({
  open,
  onOpenChange,
  reglementId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvel article',
}: ArticleReglementFormDialogProps) {
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      numero: defaultValues?.numero || '',
      titre: defaultValues?.titre || '',
      contenu: defaultValues?.contenu || '',
      categorie: defaultValues?.categorie || 'autre',
      ordre: defaultValues?.ordre ?? 0,
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: ArticleFormData) => {
    await onSubmit({
      ...data,
      reglement_id: reglementId,
      contenu: data.contenu || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations de l'article du reglement. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={ListOrdered} label="Identification">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero *</FormLabel>
                <FormControl>
                  <Input placeholder="Art. 1, 2.1..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ordre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordre *</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="titre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Titre de l'article..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categorie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categorie *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="parties_privatives">Parties privatives</SelectItem>
                  <SelectItem value="parties_communes">Parties communes</SelectItem>
                  <SelectItem value="charges">Charges</SelectItem>
                  <SelectItem value="usage">Usage</SelectItem>
                  <SelectItem value="travaux">Travaux</SelectItem>
                  <SelectItem value="conseil_syndical">Conseil syndical</SelectItem>
                  <SelectItem value="ag">Assemblee generale</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={FileText} label="Contenu">
        <FormField
          control={form.control}
          name="contenu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu de l'article</FormLabel>
              <FormControl>
                <Textarea rows={5} placeholder="Texte complet de l'article..." {...field} />
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
                <Textarea rows={2} placeholder="Notes complementaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
