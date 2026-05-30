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
            Portabilite des donnees
          </CardTitle>
          <CardDescription>
            Telechargez l&apos;ensemble de vos donnees
            personnelles au format JSON (Article 20 du RGPD).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => gdprApi.exportMyData()}
          >
            <Download className="mr-2 size-4" />
            Telecharger mes donnees
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            Politique de confidentialite
          </CardTitle>
          <CardDescription>
            Consultez notre politique de traitement des donnees
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
            Voir la politique de confidentialite
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">
            Zone dangereuse
          </CardTitle>
          <CardDescription>
            La suppression de votre compte est irreversible. Vos
            donnees personnelles seront anonymisees. Les donnees
            financieres seront conservees conformement a la loi
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
