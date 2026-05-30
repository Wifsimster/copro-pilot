import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, MapPin, Info } from 'lucide-react'
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
import type { Copropriete } from '@/types'

const coproprieteSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  adresse: z.string().min(1, "L'adresse est obligatoire"),
  code_postal: z.string().min(1, 'Le code postal est obligatoire').max(10),
  ville: z.string().min(1, 'La ville est obligatoire'),
  nombre_lots: z.coerce.number().min(0).optional(),
  numero_immatriculation: z.string().optional(),
  nombre_batiments: z.coerce.number().min(0).optional(),
  nombre_ascenseurs: z.coerce.number().min(0).optional(),
  periode_construction: z.string().optional(),
  type_chauffage: z.enum(['individuel', 'collectif', 'mixte']).optional().or(z.literal('')),
  energie_chauffage: z.enum(['gaz', 'electricite', 'fioul', 'bois', 'pompe_chaleur', 'reseau_chaleur', 'autre']).optional().or(z.literal('')),
})

type CoproprieteFormData = z.infer<typeof coproprieteSchema>

interface CoproprieteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Copropriete>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Copropriete>
  title?: string
}

export function CoproprieteFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle copropriete',
}: CoproprieteFormDialogProps) {
  const form = useForm<CoproprieteFormData>({
    resolver: zodResolver(coproprieteSchema),
    values: {
      nom: defaultValues?.nom || '',
      adresse: defaultValues?.adresse || '',
      code_postal: defaultValues?.code_postal || '',
      ville: defaultValues?.ville || '',
      nombre_lots: defaultValues?.nombre_lots || 0,
      numero_immatriculation: defaultValues?.numero_immatriculation || '',
      nombre_batiments: defaultValues?.nombre_batiments || 0,
      nombre_ascenseurs: defaultValues?.nombre_ascenseurs || 0,
      periode_construction: defaultValues?.periode_construction || '',
      type_chauffage: defaultValues?.type_chauffage || '',
      energie_chauffage: defaultValues?.energie_chauffage || '',
    },
  })

  
  const handleFormSubmit = async (data: CoproprieteFormData) => {
    const cleanData = {
      ...data,
      type_chauffage: data.type_chauffage || null,
      energie_chauffage: data.energie_chauffage || null,
    }
    await onSubmit(cleanData)
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations de la copropriete. Les champs marques d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="lg"
    >
      <FormSection icon={Building2} label="Informations generales">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom *</FormLabel>
              <FormControl>
                <Input placeholder="Residence Les Tilleuls" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection icon={MapPin} label="Adresse">
        <FormField
          control={form.control}
          name="adresse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adresse *</FormLabel>
              <FormControl>
                <Input placeholder="12 rue de la Paix" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code_postal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code postal *</FormLabel>
                <FormControl>
                  <Input placeholder="75001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ville"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ville *</FormLabel>
                <FormControl>
                  <Input placeholder="Paris" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Info} label="Informations complementaires">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre_lots"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de lots</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numero_immatriculation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° immatriculation</FormLabel>
                <FormControl>
                  <Input placeholder="AB1234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={Building2} label="Caracteristiques du batiment">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre_batiments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de batiments</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre_ascenseurs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre d'ascenseurs</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="periode_construction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Periode de construction</FormLabel>
              <FormControl>
                <Input placeholder="ex: 1960-1970" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type_chauffage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de chauffage</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="individuel">Individuel</SelectItem>
                    <SelectItem value="collectif">Collectif</SelectItem>
                    <SelectItem value="mixte">Mixte</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="energie_chauffage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Energie</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="--" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gaz">Gaz</SelectItem>
                    <SelectItem value="electricite">Electricite</SelectItem>
                    <SelectItem value="fioul">Fioul</SelectItem>
                    <SelectItem value="bois">Bois</SelectItem>
                    <SelectItem value="pompe_chaleur">Pompe a chaleur</SelectItem>
                    <SelectItem value="reseau_chaleur">Reseau de chaleur</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
    </FormDialog>
  )
}
