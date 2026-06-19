import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { FormDialog } from '@/components/ui/form-dialog'
import { DeclarationInfosFields } from '@/components/immatriculation/DeclarationInfosFields'
import { DeclarationDonneesPreview } from '@/components/immatriculation/DeclarationDonneesPreview'
import type { DeclarationRegistre, DonneesDeclarees } from '@/types'

const declarationSchema = z.object({
  annee: z.coerce.number().min(2000, 'Année invalide').max(2100, 'Année invalide'),
  date_declaration: z.string().optional(),
  statut: z.enum(['brouillon', 'soumis', 'valide']),
  notes: z.string().optional(),
})

type DeclarationFormData = z.infer<typeof declarationSchema>

interface DeclarationFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<DeclarationRegistre>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<DeclarationRegistre>
  title?: string
  donneesPreparees?: DonneesDeclarees | null
}

export function DeclarationFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouvelle déclaration',
  donneesPreparees,
}: DeclarationFormDialogProps) {
  const form = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationSchema),
    values: {
      annee: defaultValues?.annee || new Date().getFullYear(),
      date_declaration: defaultValues?.date_declaration || '',
      statut: defaultValues?.statut || 'brouillon',
      notes: defaultValues?.notes || '',
    },
  })


  const handleFormSubmit = async (data: DeclarationFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_declaration: data.date_declaration || null,
      donnees_declarees: donneesPreparees || defaultValues?.donnees_declarees || null,
      notes: data.notes || null,
    })
    form.reset()
  }

  const donnees = donneesPreparees || defaultValues?.donnees_declarees

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations de la déclaration annuelle au registre national."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="2xl"
    >
      <DeclarationInfosFields control={form.control} />

      {donnees && <DeclarationDonneesPreview donnees={donnees} />}

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
