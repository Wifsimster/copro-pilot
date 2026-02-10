import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarDays, FileText, Building2, Landmark, Banknote, Users } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { DeclarationRegistre, DonneesDeclarees } from '@/types'

const declarationSchema = z.object({
  annee: z.coerce.number().min(2000, 'Annee invalide').max(2100, 'Annee invalide'),
  date_declaration: z.string().optional(),
  statut: z.enum(['brouillon', 'soumis', 'valide']),
  notes: z.string().optional(),
})

type DeclarationFormData = z.infer<typeof declarationSchema>

const DIAG_STATUT_COLORS: Record<string, string> = {
  valide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  expire: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  a_renouveler: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

const DIAG_STATUT_LABELS: Record<string, string> = {
  valide: 'Valide',
  expire: 'Expire',
  a_renouveler: 'A renouveler',
}

const formatCurrency = (value: number) =>
  Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })

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
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
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

                <Tabs defaultValue="identification" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="identification" className="flex items-center gap-1.5">
                      <Building2 className="size-3.5" />
                      Identification
                    </TabsTrigger>
                    <TabsTrigger value="patrimoine" className="flex items-center gap-1.5">
                      <Landmark className="size-3.5" />
                      Patrimoine
                    </TabsTrigger>
                    <TabsTrigger value="finances" className="flex items-center gap-1.5">
                      <Banknote className="size-3.5" />
                      Finances
                    </TabsTrigger>
                    <TabsTrigger value="organisation" className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      Organisation
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab: Identification + Gouvernance */}
                  <TabsContent value="identification" className="mt-4 space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                      <h4 className="font-medium text-gray-900 dark:text-white">Identification</h4>
                      <p className="mt-1 text-gray-600 dark:text-zinc-400">
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
                      {donnees.identification.periode_construction && (
                        <p className="text-gray-600 dark:text-zinc-400">
                          Periode de construction : {donnees.identification.periode_construction}
                        </p>
                      )}
                      {donnees.identification.type_chauffage && (
                        <p className="text-gray-600 dark:text-zinc-400">
                          Chauffage : {donnees.identification.type_chauffage}
                          {donnees.identification.energie_chauffage && ` (${donnees.identification.energie_chauffage})`}
                        </p>
                      )}
                    </div>

                    {donnees.gouvernance && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                        <h4 className="font-medium text-gray-900 dark:text-white">Gouvernance — Syndic</h4>
                        <p className="mt-1 text-gray-600 dark:text-zinc-400">
                          {donnees.gouvernance.syndic_nom}
                        </p>
                        <p className="text-gray-600 dark:text-zinc-400">
                          Contrat du {new Date(donnees.gouvernance.contrat_date_debut).toLocaleDateString('fr-FR')} au {new Date(donnees.gouvernance.contrat_date_fin).toLocaleDateString('fr-FR')}
                        </p>
                        {donnees.gouvernance.remuneration_forfait != null && (
                          <p className="text-gray-600 dark:text-zinc-400">
                            Remuneration forfaitaire : {formatCurrency(donnees.gouvernance.remuneration_forfait)}
                          </p>
                        )}
                        <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          donnees.gouvernance.contrat_statut === 'en_cours'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}>
                          {donnees.gouvernance.contrat_statut === 'en_cours' ? 'En cours' : donnees.gouvernance.contrat_statut}
                        </span>
                      </div>
                    )}

                    {!donnees.gouvernance && (
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm dark:border-orange-900/50 dark:bg-orange-900/20">
                        <p className="text-orange-700 dark:text-orange-400">Aucun contrat de syndic actif</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab: Patrimoine (Lots + Diagnostics) */}
                  <TabsContent value="patrimoine" className="mt-4 space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                      <h4 className="font-medium text-gray-900 dark:text-white">Lots</h4>
                      <p className="mt-1 text-gray-600 dark:text-zinc-400">
                        {donnees.lots.total} lot(s) — {donnees.lots.total_tantiemes} tantiemes — {donnees.lots.nombre_coproprietaires} coproprietaire(s)
                      </p>
                      {donnees.lots.par_type.length > 0 && (
                        <p className="text-gray-500 dark:text-zinc-500">
                          {donnees.lots.par_type.map(t => `${t.type}: ${t.count}`).join(', ')}
                        </p>
                      )}
                    </div>

                    {donnees.diagnostics && donnees.diagnostics.length > 0 ? (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                        <h4 className="font-medium text-gray-900 dark:text-white">Diagnostics</h4>
                        <div className="mt-2 space-y-2">
                          {donnees.diagnostics.map((d, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span className="text-gray-600 dark:text-zinc-400 uppercase text-xs font-medium">
                                {d.type}
                              </span>
                              <div className="flex items-center gap-2">
                                {d.date_validite && (
                                  <span className="text-xs text-gray-500 dark:text-zinc-500">
                                    Valide jusqu'au {new Date(d.date_validite).toLocaleDateString('fr-FR')}
                                  </span>
                                )}
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${DIAG_STATUT_COLORS[d.statut] || 'bg-gray-100 text-gray-700'}`}>
                                  {DIAG_STATUT_LABELS[d.statut] || d.statut}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                        <h4 className="font-medium text-gray-900 dark:text-white">Diagnostics</h4>
                        <p className="mt-1 text-gray-500 dark:text-zinc-500">Aucun diagnostic enregistre</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab: Finances + Procedures */}
                  <TabsContent value="finances" className="mt-4 space-y-4">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                      <h4 className="font-medium text-gray-900 dark:text-white">Finances</h4>
                      {donnees.finances.budget_montant != null ? (
                        <p className="mt-1 text-gray-600 dark:text-zinc-400">
                          Budget {donnees.finances.budget_annee} : {formatCurrency(donnees.finances.budget_montant)} ({donnees.finances.budget_statut})
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-500 dark:text-zinc-500">Aucun budget pour cette annee</p>
                      )}
                      <p className="text-gray-600 dark:text-zinc-400">
                        Appels de fonds : {donnees.finances.appels_fonds_nombre} ({formatCurrency(donnees.finances.appels_fonds_montant)})
                      </p>
                      {donnees.finances.fonds_travaux_solde != null && (
                        <p className="text-gray-600 dark:text-zinc-400">
                          Fonds travaux : {formatCurrency(donnees.finances.fonds_travaux_solde)}
                        </p>
                      )}
                      {donnees.finances.total_impayes != null && (
                        <p className={donnees.finances.total_impayes > 0
                          ? 'font-medium text-red-600 dark:text-red-400'
                          : 'text-gray-600 dark:text-zinc-400'
                        }>
                          Impayes : {formatCurrency(donnees.finances.total_impayes)}
                        </p>
                      )}
                    </div>

                    {donnees.procedures && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                        <h4 className="font-medium text-gray-900 dark:text-white">Procedures judiciaires</h4>
                        {donnees.procedures.nombre_actives > 0 ? (
                          <>
                            <p className="mt-1 text-gray-600 dark:text-zinc-400">
                              {donnees.procedures.nombre_actives} procedure(s) active(s)
                            </p>
                            <p className="text-gray-600 dark:text-zinc-400">
                              Montant total reclame : {formatCurrency(donnees.procedures.montant_total_reclame)}
                            </p>
                          </>
                        ) : (
                          <p className="mt-1 text-green-600 dark:text-green-400">Aucune procedure active</p>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Tab: Organisation (AG + Personnel) */}
                  <TabsContent value="organisation" className="mt-4 space-y-4">
                    {donnees.assemblee_generale ? (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                        <h4 className="font-medium text-gray-900 dark:text-white">Derniere assemblee generale</h4>
                        <p className="mt-1 text-gray-600 dark:text-zinc-400">
                          {new Date(donnees.assemblee_generale.derniere_ag_date).toLocaleDateString('fr-FR')} — {donnees.assemblee_generale.derniere_ag_type === 'ordinaire' ? 'Ordinaire' : 'Extraordinaire'}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm dark:border-orange-900/50 dark:bg-orange-900/20">
                        <p className="text-orange-700 dark:text-orange-400">Aucune assemblee generale terminee</p>
                      </div>
                    )}

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                      <h4 className="font-medium text-gray-900 dark:text-white">Personnel</h4>
                      {donnees.personnel.nombre_employes > 0 ? (
                        <p className="mt-1 text-gray-600 dark:text-zinc-400">
                          {donnees.personnel.nombre_employes} employe(s) : {donnees.personnel.employes.map(e => `${e.prenom} ${e.nom} (${e.poste})`).join(', ')}
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-500 dark:text-zinc-500">Aucun employe</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
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
