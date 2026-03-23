import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Home, Ruler, FileText } from 'lucide-react'
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
import type { Lot, TypeLot } from '@/types'

const TYPE_OPTIONS: { value: TypeLot; label: string }[] = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'cave', label: 'Cave' },
  { value: 'parking', label: 'Parking' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'autre', label: 'Autre' },
]

const lotSchema = z.object({
  numero: z.string().min(1, 'Le numéro est obligatoire'),
  type: z.enum(['appartement', 'cave', 'parking', 'commerce', 'bureau', 'autre']),
  surface: z.coerce.number().positive('La surface doit être positive').optional().or(z.literal('')),
  etage: z.coerce.number().optional().or(z.literal('')),
  tantiemes: z.coerce.number().min(1, 'Les tantièmes sont obligatoires'),
  description: z.string().optional(),
})

type LotFormData = z.infer<typeof lotSchema>

interface LotFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coproprieteId: number
  onSubmit: (data: Partial<Lot>) => Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<Lot>
  title?: string
}

export function LotFormDialog({
  open,
  onOpenChange,
  coproprieteId,
  onSubmit,
  isLoading,
  defaultValues,
  title = 'Nouveau lot',
}: LotFormDialogProps) {
  const form = useForm<LotFormData>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      numero: defaultValues?.numero || '',
      type: defaultValues?.type || 'appartement',
      surface: defaultValues?.surface ?? '',
      etage: defaultValues?.etage ?? '',
      tantiemes: defaultValues?.tantiemes || 0,
      description: defaultValues?.description || '',
    },
  })

  const handleFormSubmit = async (data: LotFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      surface: data.surface === '' ? null : Number(data.surface),
      etage: data.etage === '' ? null : Number(data.etage),
      tantiemes: Number(data.tantiemes),
    })
    form.reset()
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Renseignez les informations du lot. Les champs marqués d'un * sont obligatoires."
      form={form}
      onSubmit={handleFormSubmit}
      isLoading={isLoading}
      size="md"
    >
      <FormSection icon={Home} label="Identification">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numero *</FormLabel>
                <FormControl>
                  <Input placeholder="A101" {...field} />
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
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
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

      <FormSection icon={Ruler} label="Caracteristiques">
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="surface"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface (m²)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="45" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="etage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Etage</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="3" {...field} />
                </FormControl>
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
                  <Input type="number" placeholder="150" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection icon={FileText} label="Description">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Appartement 3 pieces, balcon..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
