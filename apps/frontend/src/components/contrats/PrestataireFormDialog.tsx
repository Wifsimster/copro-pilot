import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, User, FileText } from 'lucide-react'
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
import type { Prestataire } from '@/types'

const prestataireSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  siret: z.string().optional(),
  specialite: z.string().optional(),
  contact_nom: z.string().optional(),
  contact_email: z.string().optional(),
  contact_telephone: z.string().optional(),
  adresse: z.string().optional(),
  notes: z.string().optional(),
})

type PrestataireFormData = z.infer<typeof prestataireSchema>

interface PrestataireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Prestataire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Prestataire>
  title?: string
}

export function PrestataireFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau prestataire',
}: PrestataireFormDialogProps) {
  const form = useForm<PrestataireFormData>({
    resolver: zodResolver(prestataireSchema),
    values: {
      nom: defaultValues?.nom || '',
      siret: defaultValues?.siret || '',
      specialite: defaultValues?.specialite || '',
      contact_nom: defaultValues?.contact_nom || '',
      contact_email: defaultValues?.contact_email || '',
      contact_telephone: defaultValues?.contact_telephone || '',
      adresse: defaultValues?.adresse || '',
      notes: defaultValues?.notes || '',
    },
  })

  
  const handleFormSubmit = async (data: PrestataireFormData) => {
    await onSubmit({
      ...data,
      siret: data.siret || null,
      specialite: data.specialite || null,
      contact_nom: data.contact_nom || null,
      contact_email: data.contact_email || null,
      contact_telephone: data.contact_telephone || null,
      adresse: data.adresse || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations du prestataire. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Building2} label="Informations">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="siret"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SIRET</FormLabel>
                <FormControl>
                  <Input placeholder="12345678901234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specialite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialite</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionnez une specialite" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ascenseur">Ascenseur</SelectItem>
                  <SelectItem value="Nettoyage">Nettoyage</SelectItem>
                  <SelectItem value="Gardiennage">Gardiennage</SelectItem>
                  <SelectItem value="Plomberie">Plomberie</SelectItem>
                  <SelectItem value="Electricite">Electricite</SelectItem>
                  <SelectItem value="Chauffage">Chauffage</SelectItem>
                  <SelectItem value="Espaces verts">Espaces verts</SelectItem>
                  <SelectItem value="Securite">Securite</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={User} label="Contact">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="contact_nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du contact</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telephone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="adresse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={FileText} label="Notes">
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} placeholder="Notes supplementaires..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
