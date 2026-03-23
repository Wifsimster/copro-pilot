import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, CalendarDays, Banknote, FileText } from 'lucide-react'
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
import type { Assurance } from '@/types'

const assuranceSchema = z.object({
  compagnie: z.string().min(1, 'La compagnie est obligatoire'),
  numero_police: z.string().optional(),
  type: z.enum(['multirisque_immeuble', 'responsabilite_civile', 'dommages_ouvrage', 'protection_juridique', 'autre']),
  date_debut: z.string().min(1, 'La date de debut est obligatoire'),
  date_fin: z.string().optional(),
  prime_annuelle: z.string().optional(),
  franchise: z.string().optional(),
  statut: z.enum(['actif', 'expire', 'resilie']),
  notes: z.string().optional(),
})

type AssuranceFormData = z.infer<typeof assuranceSchema>

interface AssuranceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Assurance>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Assurance>
  title?: string
}

export function AssuranceFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle assurance',
}: AssuranceFormDialogProps) {
  const form = useForm<AssuranceFormData>({
    resolver: zodResolver(assuranceSchema),
    values: {
      compagnie: defaultValues?.compagnie || '',
      numero_police: defaultValues?.numero_police || '',
      type: defaultValues?.type || 'multirisque_immeuble',
      date_debut: defaultValues?.date_debut || new Date().toISOString().split('T')[0],
      date_fin: defaultValues?.date_fin || '',
      prime_annuelle: defaultValues?.prime_annuelle != null ? String(defaultValues.prime_annuelle) : '',
      franchise: defaultValues?.franchise != null ? String(defaultValues.franchise) : '',
      statut: defaultValues?.statut || 'actif',
      notes: defaultValues?.notes || '',
    },
  })

  
  const handleFormSubmit = async (data: AssuranceFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      numero_police: data.numero_police || null,
      date_fin: data.date_fin || null,
      prime_annuelle: data.prime_annuelle ? parseFloat(data.prime_annuelle) : null,
      franchise: data.franchise ? parseFloat(data.franchise) : null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations de la police d'assurance. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Shield} label="Informations de la police">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="compagnie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compagnie *</FormLabel>
                <FormControl>
                  <Input placeholder="AXA, MAIF, Allianz..." {...field} />
                </FormControl>
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
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="expire">Expire</SelectItem>
                    <SelectItem value="resilie">Resilie</SelectItem>
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
            name="numero_police"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero de police</FormLabel>
                <FormControl>
                  <Input placeholder="POL-2024-0001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    <SelectItem value="multirisque_immeuble">Multirisque immeuble</SelectItem>
                    <SelectItem value="responsabilite_civile">Responsabilite civile</SelectItem>
                    <SelectItem value="dommages_ouvrage">Dommages-ouvrage</SelectItem>
                    <SelectItem value="protection_juridique">Protection juridique</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={CalendarDays} label="Periode de couverture">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date_debut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de debut *</FormLabel>
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

      <FormSection icon={Banknote} label="Montants">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prime_annuelle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prime annuelle</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="franchise"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Franchise</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Notes">
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
