import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftRight, StickyNote } from 'lucide-react'
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
import { useCoproprietaires } from '@/hooks/useCoproprietaires'
import type { Mutation, TypeMutation } from '@/types'

const schema = z.object({
  type: z.enum(['vente', 'donation', 'succession', 'autre']),
  date_mutation: z.string().min(1, 'La date est obligatoire'),
  ancien_proprietaire_id: z.coerce.number().positive().optional().or(z.literal(0)),
  nouveau_proprietaire_id: z.coerce.number().positive('Le nouveau proprietaire est obligatoire'),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  lotId: number
  onSubmit: (data: Partial<Mutation>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Mutation>
  title?: string
}

export function MutationFormDialog({ open, onOpenChange, lotId, onSubmit, isLoading, defaultValues, title = 'Nouvelle mutation' }: Props) {
  const { data: coproprietaires } = useCoproprietaires()
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (defaultValues?.type as FormData['type']) || 'vente',
      date_mutation: defaultValues?.date_mutation || new Date().toISOString().split('T')[0],
      ancien_proprietaire_id: defaultValues?.ancien_proprietaire_id || 0,
      nouveau_proprietaire_id: defaultValues?.nouveau_proprietaire_id || 0,
      notes: defaultValues?.notes || '',
    },
  })

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      lot_id: lotId,
      type: data.type as TypeMutation,
      date_mutation: data.date_mutation,
      ancien_proprietaire_id: data.ancien_proprietaire_id && data.ancien_proprietaire_id > 0 ? data.ancien_proprietaire_id : null,
      nouveau_proprietaire_id: data.nouveau_proprietaire_id,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations de la mutation. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={onFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={ArrowLeftRight} label="Mutation">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vente">Vente</SelectItem>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="succession">Succession</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_mutation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
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
            name="ancien_proprietaire_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ancien proprietaire</FormLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value || 0)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="— Aucun —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">- Aucun -</SelectItem>
                    {coproprietaires?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.prenom} {c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nouveau_proprietaire_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nouveau proprietaire *</FormLabel>
                <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value || 0)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="— Selectionner —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">- Selectionner -</SelectItem>
                    {coproprietaires?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.prenom} {c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={StickyNote} label="Informations complementaires">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Informations complementaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
