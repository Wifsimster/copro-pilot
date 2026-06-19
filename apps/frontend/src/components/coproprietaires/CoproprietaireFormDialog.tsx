import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormDialog } from '@/components/ui/form-dialog'
import { FormSection } from '@/components/ui/form-section'
import type { Coproprietaire } from '@/types'

const coproprietaireSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire'),
  prenom: z.string().min(1, 'Le prenom est obligatoire'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  telephone: z.string().optional(),
  adresse_correspondance: z.string().optional(),
})

type CoproprietaireFormData = z.infer<typeof coproprietaireSchema>

interface CoproprietaireFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Coproprietaire>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Coproprietaire>
  title?: string
}

export function CoproprietaireFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau copropriétaire',
}: CoproprietaireFormDialogProps) {
  const form = useForm<CoproprietaireFormData>({
    resolver: zodResolver(coproprietaireSchema),
    values: {
      nom: defaultValues?.nom || '',
      prenom: defaultValues?.prenom || '',
      email: defaultValues?.email || '',
      telephone: defaultValues?.telephone || '',
      adresse_correspondance: defaultValues?.adresse_correspondance || '',
    },
  })

  
  const handleFormSubmit = async (data: CoproprietaireFormData) => {
    await onSubmit({
      ...data,
      email: data.email || null,
      telephone: data.telephone || null,
      adresse_correspondance: data.adresse_correspondance || null,
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations du copropriétaire. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={User} label="Identite">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prenom *</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
        </div>
      </FormSection>

      <FormSection icon={Mail} label="Coordonnees">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telephone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Phone className="size-3.5 text-muted-foreground" />
                  Telephone
                </FormLabel>
                <FormControl>
                  <Input placeholder="06 12 34 56 78" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="adresse_correspondance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-muted-foreground" />
                Adresse de correspondance
              </FormLabel>
              <FormControl>
                <Input placeholder="12 rue de la Paix, 75001 Paris" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
