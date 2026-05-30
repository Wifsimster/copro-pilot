import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
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
import type { PresenceAG } from '@/types'
import {  } from 'react'

const schema = z.object({
  coproprietaire_id: z.coerce.number().positive('Le coproprietaire est obligatoire'),
  statut: z.enum(['present', 'absent', 'represente']),
  represente_par_id: z.coerce.number().optional().or(z.literal(0)),
  tantiemes: z.coerce.number().min(0),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  agId: number
  onSubmit: (data: Partial<PresenceAG>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<PresenceAG>
  title?: string
}

export function PresenceFormDialog({ open, onOpenChange, agId, onSubmit, isLoading, defaultValues, title = 'Ajouter une presence' }: Props) {
  const { data: coproprietaires } = useCoproprietaires()
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
      statut: defaultValues?.statut ?? 'present',
      represente_par_id: defaultValues?.represente_par_id ?? 0,
      tantiemes: defaultValues?.tantiemes ?? 0,
    },
  })

  
  const currentStatut = form.watch('statut')

  const onFormSubmit = async (data: FormData) => {
    await onSubmit({
      ag_id: agId,
      coproprietaire_id: data.coproprietaire_id,
      statut: data.statut,
      represente_par_id: data.statut === 'represente' && data.represente_par_id && data.represente_par_id > 0
        ? data.represente_par_id
        : null,
      tantiemes: data.tantiemes,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Enregistrez la presence d'un coproprietaire. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={onFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={Users} label="Presence">
        <FormField
          control={form.control}
          name="coproprietaire_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coproprietaire *</FormLabel>
              <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Selectionner --" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="0">-- Selectionner --</SelectItem>
                  {coproprietaires?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.prenom} {c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="represente">Represente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tantiemes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tantiemes *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {currentStatut === 'represente' && (
          <FormField
            control={form.control}
            name="represente_par_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Represente par</FormLabel>
                <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="-- Aucun --" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="0">-- Aucun --</SelectItem>
                    {coproprietaires?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.prenom} {c.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </FormSection>
    </FormDialog>
  )
}
