import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ConsentManager } from '@/components/gdpr/ConsentManager'
import { DeleteAccountDialog } from '@/components/gdpr/DeleteAccountDialog'
import { gdprApi } from '@/api/gdpr'
import {
  Download,
  ExternalLink,
  Shield,
} from 'lucide-react'

export default function DonneesPersonnellesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Mes données personnelles
        </h1>
        <p className="text-muted-foreground">
          Gérez vos données personnelles conformément au RGPD.
        </p>
      </div>

      <ConsentManager />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="size-5" />
            Portabilité des données
          </CardTitle>
          <CardDescription>
            Téléchargez l&apos;ensemble de vos données
            personnelles au format JSON (Article 20 du RGPD).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => gdprApi.exportMyData()}
          >
            <Download className="mr-2 size-4" />
            Télécharger mes données
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Politique de confidentialité
          </CardTitle>
          <CardDescription>
            Consultez notre politique de traitement des données
            personnelles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                '/politique-confidentialite',
                '_blank'
              )
            }
          >
            <ExternalLink className="mr-2 size-4" />
            Voir la politique de confidentialité
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">
            Zone dangereuse
          </CardTitle>
          <CardDescription>
            La suppression de votre compte est irréversible. Vos
            données personnelles seront anonymisées. Les données
            financières seront conservées conformément à la loi
            (10 ans).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  )
}
