import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, CalendarDays, Banknote } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { EmployeSyndicat } from '@/types'

const employeSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prénom est obligatoire'),
  poste: z.string().min(1, 'Le poste est obligatoire'),
  type_contrat: z.enum(['cdi', 'cdd', 'interim', 'saisonnier']),
  date_embauche: z.string().min(1, 'La date d\'embauche est obligatoire'),
  date_fin: z.string().optional(),
  salaire_brut: z.string().optional(),
  logement_fonction: z.boolean(),
  statut: z.enum(['actif', 'inactif']),
  notes: z.string().optional(),
})

type EmployeFormData = z.infer<typeof employeSchema>

interface EmployeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<EmployeSyndicat>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<EmployeSyndicat>
  title?: string
}

export function EmployeFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvel employé',
}: EmployeFormDialogProps) {
  const form = useForm<EmployeFormData>({
    resolver: zodResolver(employeSchema),
    defaultValues: {
      nom: defaultValues?.nom || '',
      prenom: defaultValues?.prenom || '',
      poste: defaultValues?.poste || '',
      type_contrat: defaultValues?.type_contrat || 'cdi',
      date_embauche: defaultValues?.date_embauche || new Date().toISOString().split('T')[0],
      date_fin: defaultValues?.date_fin || '',
      salaire_brut: defaultValues?.salaire_brut != null ? String(defaultValues.salaire_brut) : '',
      logement_fonction: defaultValues?.logement_fonction || false,
      statut: defaultValues?.statut || 'actif',
      notes: defaultValues?.notes || '',
    },
  })

  const handleFormSubmit = async (data: EmployeFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_fin: data.date_fin || null,
      salaire_brut: data.salaire_brut ? parseFloat(data.salaire_brut) : null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations de l'employé. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={User} label="Identité">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom *</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="poste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poste *</FormLabel>
                <FormControl>
                  <Input placeholder="Gardien, concierge..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type_contrat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de contrat *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cdi">CDI</SelectItem>
                    <SelectItem value="cdd">CDD</SelectItem>
                    <SelectItem value="interim">Intérim</SelectItem>
                    <SelectItem value="saisonnier">Saisonnier</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value="inactif">Inactif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={CalendarDays} label="Période d'emploi">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_embauche"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'embauche *</FormLabel>
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
      </FormSection>

      <FormSection icon={Banknote} label="Rémunération & logement">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="salaire_brut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salaire brut mensuel</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logement_fonction"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 pt-6">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer">Logement de fonction</FormLabel>
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea rows={3} placeholder="Informations complémentaires..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  )
}
