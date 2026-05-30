import { useState } from 'react'
import { Download, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgPackComplet } from '@/hooks/useAgReports'
import type { AgReportPack } from '@/types'

interface AgReportViewerProps {
  coproprieteId: number
}

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)} %`
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR')

function formatDate(value: string | null): string {
  if (!value) return '-'
  return dateFormatter.format(new Date(value))
}

function Annexe1Table({ data }: { data: AgReportPack['annexe1'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annexe 1 - Etat financier</CardTitle>
        <CardDescription>
          Comparaison budget previsionnel vs realise par poste de
          depenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Poste</TableHead>
              <TableHead className="text-right">
                Budget prevu
              </TableHead>
              <TableHead className="text-right">Realise</TableHead>
              <TableHead className="text-right">Ecart</TableHead>
              <TableHead className="text-right">Ecart %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.postes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucun poste de depenses
                </TableCell>
              </TableRow>
            ) : (
              data.postes.map((p) => (
                <TableRow key={p.nom}>
                  <TableCell className="font-medium">{p.nom}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(p.budget_prevu)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(p.realise)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        p.ecart > 0
                          ? 'text-destructive'
                          : p.ecart < 0
                            ? 'text-green-600'
                            : ''
                      }
                    >
                      {formatCurrency(p.ecart)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        Math.abs(p.ecart_pct) > 10
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {formatPercent(p.ecart_pct)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {data.postes.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(data.total_prevu)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(data.total_realise)}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(
                    data.total_realise - data.total_prevu
                  )}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </CardContent>
    </Card>
  )
}

function Annexe2Table({ data }: { data: AgReportPack['annexe2'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annexe 2 - Situation de tresorerie</CardTitle>
        <CardDescription>
          Soldes des comptes bancaires et suivi des appels de fonds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compte</TableHead>
              <TableHead>IBAN</TableHead>
              <TableHead className="text-right">Solde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.comptes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Aucun compte bancaire
                </TableCell>
              </TableRow>
            ) : (
              data.comptes.map((c) => (
                <TableRow key={c.iban}>
                  <TableCell className="font-medium">{c.nom}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {c.iban}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(c.solde)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {data.comptes.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold">
                  Total tresorerie
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(data.total_tresorerie)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                Appels emis
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.appels_emis)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                Appels recus
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.appels_recus)}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

function Annexe3Table({ data }: { data: AgReportPack['annexe3'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annexe 3 - Soldes des coproprietaires</CardTitle>
        <CardDescription>
          Situation individuelle de chaque coproprietaire (appeles
          vs payes)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Lots</TableHead>
              <TableHead className="text-right">
                Total appele
              </TableHead>
              <TableHead className="text-right">
                Total paye
              </TableHead>
              <TableHead className="text-right">Solde</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.coproprietaires.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aucun coproprietaire
                </TableCell>
              </TableRow>
            ) : (
              data.coproprietaires.map((c) => (
                <TableRow key={`${c.nom}-${c.prenom}-${c.lots}`}>
                  <TableCell className="font-medium">
                    {c.nom} {c.prenom}
                  </TableCell>
                  <TableCell>{c.lots}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(c.total_appele)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(c.total_paye)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        c.solde < 0
                          ? 'text-destructive font-medium'
                          : 'text-green-600'
                      }
                    >
                      {formatCurrency(c.solde)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {data.coproprietaires.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="font-bold">
                  Total impayes
                </TableCell>
                <TableCell className="text-right font-bold text-destructive">
                  {formatCurrency(data.total_impayes)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </CardContent>
    </Card>
  )
}

function Annexe4Table({ data }: { data: AgReportPack['annexe4'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Annexe 4 - Etat des dettes fournisseurs
        </CardTitle>
        <CardDescription>
          Contrats actifs et montants dus aux prestataires
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fournisseur</TableHead>
              <TableHead>Contrat</TableHead>
              <TableHead className="text-right">
                Montant du
              </TableHead>
              <TableHead className="text-right">Echeance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.fournisseurs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Aucune dette fournisseur
                </TableCell>
              </TableRow>
            ) : (
              data.fournisseurs.map((f) => (
                <TableRow key={`${f.nom}-${f.contrat}`}>
                  <TableCell className="font-medium">{f.nom}</TableCell>
                  <TableCell>{f.contrat}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(f.montant_du)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDate(f.date_echeance)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {data.fournisseurs.length > 0 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={2} className="font-bold">
                  Total dettes
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(data.total_dettes)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </CardContent>
    </Card>
  )
}

function Annexe5Table({ data }: { data: AgReportPack['annexe5'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Annexe 5 - Fonds travaux (loi ALUR)</CardTitle>
        <CardDescription>
          Situation du fonds de travaux obligatoire et mouvements de
          l'exercice
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                Solde debut
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(data.solde_debut)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                Cotisations
              </div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(data.cotisations)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                Depenses
              </div>
              <div className="text-xl font-bold text-destructive">
                {formatCurrency(data.depenses)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground">
                Solde fin
              </div>
              <div className="text-xl font-bold">
                {formatCurrency(data.solde_fin)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libelle</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-right">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.mouvements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  Aucun mouvement
                </TableCell>
              </TableRow>
            ) : (
              data.mouvements.map((m) => (
                <TableRow key={`${m.libelle}-${m.montant}-${m.type}`}>
                  <TableCell className="font-medium">
                    {m.libelle}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(m.montant)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        m.type === 'credit'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {m.type === 'credit' ? 'Credit' : 'Debit'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function AgReportViewer({
  coproprieteId,
}: AgReportViewerProps) {
  const currentYear = new Date().getFullYear()
  const [annee, setAnnee] = useState<number>(currentYear - 1)

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const { data, isLoading, isError } = useAgPackComplet(
    coproprieteId,
    annee
  )

  const handleDownload = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `annexes-ag-${coproprieteId}-${annee}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            Annexes financieres AG
          </h2>
          <Select
            value={String(annee)}
            onValueChange={v => setAnnee(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={handleDownload}
          disabled={!data || isLoading}
        >
          <Download className="mr-2 size-4" />
          Telecharger le pack
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Impossible de charger les annexes financieres.
          </CardContent>
        </Card>
      )}

      {data && (
        <Tabs defaultValue="annexe1">
          <TabsList>
            <TabsTrigger value="annexe1">
              1. Etat financier
            </TabsTrigger>
            <TabsTrigger value="annexe2">
              2. Tresorerie
            </TabsTrigger>
            <TabsTrigger value="annexe3">
              3. Soldes copro.
            </TabsTrigger>
            <TabsTrigger value="annexe4">
              4. Dettes fourn.
            </TabsTrigger>
            <TabsTrigger value="annexe5">
              5. Fonds travaux
            </TabsTrigger>
          </TabsList>

          <TabsContent value="annexe1">
            <Annexe1Table data={data.annexe1} />
          </TabsContent>

          <TabsContent value="annexe2">
            <Annexe2Table data={data.annexe2} />
          </TabsContent>

          <TabsContent value="annexe3">
            <Annexe3Table data={data.annexe3} />
          </TabsContent>

          <TabsContent value="annexe4">
            <Annexe4Table data={data.annexe4} />
          </TabsContent>

          <TabsContent value="annexe5">
            <Annexe5Table data={data.annexe5} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
