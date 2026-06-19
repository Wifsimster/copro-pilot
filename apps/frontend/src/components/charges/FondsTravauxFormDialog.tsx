import {  } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PiggyBank } from 'lucide-react'
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
import type { FondsTravaux } from '@/types'

const schema = z.object({
  annee: z.coerce.number().min(2000).max(2100),
  cotisation_annuelle: z.coerce.number().min(0),
  solde: z.coerce.number(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<FondsTravaux>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<FondsTravaux>
  title?: string
}

export function FondsTravauxFormDialog({ open, onOpenChange, coproprieteId, onSubmit, isLoading, defaultValues, title = 'Nouveau fonds travaux' }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      annee: defaultValues?.annee || new Date().getFullYear(),
      cotisation_annuelle: defaultValues?.cotisation_annuelle || 0,
      solde: defaultValues?.solde || 0,
    },
  })

  
  const onFormSubmit = async (data: FormData) => {
    await onSubmit({ ...data, copropriete_id: coproprieteId })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Définissez le fonds travaux annuel. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={onFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={PiggyBank} label="Fonds travaux">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="annee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année *</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cotisation_annuelle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cotisation annuelle (EUR) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="solde"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solde (EUR) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
    </FormDialog>
  )
}
