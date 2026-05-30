import type { Control } from 'react-hook-form'
import { CalendarDays } from 'lucide-react'
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
import { FormSection } from '@/components/ui/form-section'

interface DeclarationInfosFieldsProps {
  control: Control<any>
}

export function DeclarationInfosFields({ control }: DeclarationInfosFieldsProps) {
  return (
    <FormSection icon={CalendarDays} label="Informations generales">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="annee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annee *</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="date_declaration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de declaration</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
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
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="soumis">Soumis</SelectItem>
                <SelectItem value="valide">Valide</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  )
}
