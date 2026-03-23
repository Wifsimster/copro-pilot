import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">
          Politique de confidentialité
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Dernière mise à jour : 19 février 2026
      </p>

      <Card>
        <CardHeader>
          <CardTitle>1. Responsable du traitement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le responsable du traitement des données
            personnelles collectées via la plateforme CoproPilot
            est le syndic de copropriété utilisant cette
            application.
          </p>
          <p>
            Pour toute question relative à la protection de vos
            données, vous pouvez contacter le syndic via les
            coordonnées fournies dans votre contrat de syndic.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            2. Finalités du traitement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Vos données personnelles sont collectées et traitées
            pour les finalités suivantes :
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Gestion de votre compte utilisateur et
              authentification
            </li>
            <li>
              Gestion de la copropriété (appels de fonds,
              charges, paiements)
            </li>
            <li>
              Communication relative aux assemblées générales
            </li>
            <li>Gestion des incidents et travaux</li>
            <li>Tenue de la comptabilité de la copropriété</li>
            <li>
              Respect des obligations légales du syndic (loi du
              10 juillet 1965, loi ALUR, loi ELAN)
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Base légale du traitement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le traitement de vos données repose sur les bases
            légales suivantes :
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Exécution du contrat</strong> : gestion de
              votre qualité de copropriétaire et des obligations
              associées
            </li>
            <li>
              <strong>Obligation légale</strong> : tenue
              comptable (Code de commerce art. L123-22),
              registre national des copropriétés, obligations du
              syndic
            </li>
            <li>
              <strong>Consentement</strong> : pour les
              communications marketing et les cookies
              analytiques
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            4. Données collectées
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Identité</strong> : nom, prénom, adresse
              email
            </li>
            <li>
              <strong>Coordonnées</strong> : téléphone, adresse
              de correspondance
            </li>
            <li>
              <strong>Données financières</strong> : paiements,
              charges, appels de fonds
            </li>
            <li>
              <strong>Données de connexion</strong> : identifiant
              de session (cookie technique)
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Durée de conservation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Données de compte</strong> : conservées
              pendant la durée de votre qualité de
              copropriétaire, puis anonymisées sur demande
            </li>
            <li>
              <strong>Données financières</strong> : conservées
              10 ans conformément au Code de commerce (art.
              L123-22)
            </li>
            <li>
              <strong>Données de session</strong> : supprimées à
              expiration de la session
            </li>
            <li>
              <strong>Notifications</strong> : conservées 1 an
              après lecture
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Vos droits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Conformément au RGPD, vous disposez des droits
            suivants :
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Droit d&apos;acces</strong> : consulter
              l&apos;ensemble de vos données via votre espace
              personnel
            </li>
            <li>
              <strong>Droit de rectification</strong> : modifier
              vos coordonnées depuis votre profil
            </li>
            <li>
              <strong>Droit à la portabilité</strong> :
              télécharger vos données au format JSON depuis votre
              espace &laquo; Mes données personnelles &raquo;
            </li>
            <li>
              <strong>Droit a l&apos;effacement</strong> :
              demander la suppression de votre compte (les
              données financières seront anonymisées mais
              conservées conformément à la loi)
            </li>
            <li>
              <strong>Droit d&apos;opposition</strong> : vous
              opposer au traitement de vos données à des fins
              marketing
            </li>
            <li>
              <strong>Droit de retrait du consentement</strong>{' '}
              : retirer vos consentements à tout moment depuis
              votre espace personnel
            </li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, rendez-vous dans la section
            &laquo; Mes données personnelles &raquo; de votre
            espace utilisateur, ou contactez votre syndic.
          </p>
          <p>
            Vous pouvez également introduire une réclamation
            auprès de la CNIL (Commission Nationale de
            l&apos;Informatique et des Libertés) sur{' '}
            <span className="font-medium">www.cnil.fr</span>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            CoproPilot utilise uniquement des cookies techniques
            nécessaires au fonctionnement du service
            (authentification de session). Aucun cookie
            publicitaire ou de pistage n&apos;est utilisé.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Sécurité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Nous mettons en oeuvre des mesures techniques et
            organisationnelles appropriées pour protéger vos
            données personnelles : chiffrement des mots de passe,
            contrôle d&apos;accès par rôles, journalisation des
            accès, en-têtes de sécurité HTTP.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
