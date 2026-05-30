import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Users, CalendarDays } from 'lucide-react'
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
import type { MembreConseilSyndical, Coproprietaire, AssembleeGenerale } from '@/types'

const membreSchema = z.object({
  coproprietaire_id: z.coerce.number().min(1, 'Le copropriétaire est obligatoire'),
  role: z.enum(['president', 'membre', 'suppleant']),
  date_election: z.string().min(1, "La date d'élection est obligatoire"),
  date_fin_mandat: z.string().optional(),
  ag_election_id: z.coerce.number().optional(),
  notes: z.string().optional(),
})

type MembreFormData = z.infer<typeof membreSchema>

interface ConseilSyndicalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  coproprietaires: Coproprietaire[]
  assemblees: AssembleeGenerale[]
  onSubmit: (data: Partial<MembreConseilSyndical>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<MembreConseilSyndical>
  title?: string
}

const roleLabels: Record<string, string> = {
  president: 'Président',
  membre: 'Membre',
  suppleant: 'Suppléant',
}

function formatAGDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR')
}

export function ConseilSyndicalFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  coproprietaires,
  assemblees,
  onSubmit,
  isLoading = false,
  defaultValues,
  title = 'Ajouter un membre',
}: ConseilSyndicalFormDialogProps) {
  const form = useForm<MembreFormData>({
    resolver: zodResolver(membreSchema),
    values: {
      coproprietaire_id: defaultValues?.coproprietaire_id ?? 0,
      role: defaultValues?.role ?? 'membre',
      date_election: defaultValues?.date_election ?? '',
      date_fin_mandat: defaultValues?.date_fin_mandat ?? '',
      ag_election_id: defaultValues?.ag_election_id ?? undefined,
      notes: defaultValues?.notes ?? '',
    },
  })

  
  const handleFormSubmit = async (data: MembreFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_fin_mandat: data.date_fin_mandat || null,
      ag_election_id: data.ag_election_id || null,
      notes: data.notes || null,
    } as Partial<MembreConseilSyndical>)
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Remplissez les informations du membre du conseil syndical."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Users} label="Membre">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="coproprietaire_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Copropriétaire *</FormLabel>
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un copropriétaire" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {coproprietaires.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nom} {c.prenom}
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
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rôle *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={CalendarDays} label="Mandat">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_election"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'élection *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date_fin_mandat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de fin de mandat</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="ag_election_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AG d'élection</FormLabel>
              <Select
                value={field.value ? String(field.value) : 'none'}
                onValueChange={(value) =>
                  field.onChange(value === 'none' ? undefined : Number(value))
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucune" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {assemblees.map((ag) => (
                    <SelectItem key={ag.id} value={String(ag.id)}>
                      AG {ag.type} du {formatAGDate(ag.date)}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Notes complémentaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
