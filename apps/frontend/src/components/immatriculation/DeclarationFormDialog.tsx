import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DeclarationRegistre, DonneesDeclarees } from '@/types'

const declarationSchema = z.object({
  annee: z.coerce.number().min(2000, 'Annee invalide').max(2100, 'Annee invalide'),
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
  title = 'Nouvelle declaration',
  donneesPreparees,
}: DeclarationFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      annee: defaultValues?.annee || new Date().getFullYear(),
      date_declaration: defaultValues?.date_declaration || '',
      statut: defaultValues?.statut || 'brouillon',
      notes: defaultValues?.notes || '',
    },
  })

  const currentStatut = watch('statut')

  const handleFormSubmit = async (data: DeclarationFormData) => {
    await onSubmit({
      ...data,
      copropriete_id: coproprieteId,
      date_declaration: data.date_declaration || null,
      donnees_declarees: donneesPreparees || defaultValues?.donnees_declarees || null,
      notes: data.notes || null,
    })
    reset()
  }

  const donnees = donneesPreparees || defaultValues?.donnees_declarees

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Renseignez les informations de la declaration annuelle au registre national.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="size-4" />
              <span>Informations generales</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annee">Annee *</Label>
                <Input id="annee" type="number" {...register('annee')} />
                {errors.annee && (
                  <p className="text-sm text-destructive">{errors.annee.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_declaration">Date de declaration</Label>
                <Input id="date_declaration" type="date" {...register('date_declaration')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statut">Statut *</Label>
              <Select value={currentStatut} onValueChange={(val) => setValue('statut', val as DeclarationFormData['statut'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="soumis">Soumis</SelectItem>
                  <SelectItem value="valide">Valide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {donnees && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="size-4" />
                  <span>Donnees declarees</span>
                </div>

                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Identification</h4>
                    <p className="text-gray-600 dark:text-zinc-400">
                      {donnees.identification.nom} — {donnees.identification.adresse}, {donnees.identification.code_postal} {donnees.identification.ville}
                    </p>
                    {donnees.identification.numero_immatriculation && (
                      <p className="text-gray-600 dark:text-zinc-400">
                        N° immatriculation : {donnees.identification.numero_immatriculation}
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-zinc-400">
                      {donnees.identification.nombre_batiments} batiment(s), {donnees.identification.nombre_ascenseurs} ascenseur(s)
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Lots</h4>
                    <p className="text-gray-600 dark:text-zinc-400">
                      {donnees.lots.total} lot(s) — {donnees.lots.total_tantiemes} tantiemes — {donnees.lots.nombre_coproprietaires} coproprietaire(s)
                    </p>
                    {donnees.lots.par_type.length > 0 && (
                      <p className="text-gray-500 dark:text-zinc-500">
                        {donnees.lots.par_type.map(t => `${t.type}: ${t.count}`).join(', ')}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Finances</h4>
                    {donnees.finances.budget_montant != null ? (
                      <p className="text-gray-600 dark:text-zinc-400">
                        Budget {donnees.finances.budget_annee} : {Number(donnees.finances.budget_montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} ({donnees.finances.budget_statut})
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-zinc-500">Aucun budget pour cette annee</p>
                    )}
                    <p className="text-gray-600 dark:text-zinc-400">
                      Appels de fonds : {donnees.finances.appels_fonds_nombre} ({Number(donnees.finances.appels_fonds_montant).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })})
                    </p>
                    {donnees.finances.fonds_travaux_solde != null && (
                      <p className="text-gray-600 dark:text-zinc-400">
                        Fonds travaux : {Number(donnees.finances.fonds_travaux_solde).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Personnel</h4>
                    {donnees.personnel.nombre_employes > 0 ? (
                      <p className="text-gray-600 dark:text-zinc-400">
                        {donnees.personnel.nombre_employes} employe(s) : {donnees.personnel.employes.map(e => `${e.prenom} ${e.nom} (${e.poste})`).join(', ')}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-zinc-500">Aucun employe</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea {...register('notes')} rows={3} placeholder="Informations complementaires..." />
          </div>

          <Separator />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
