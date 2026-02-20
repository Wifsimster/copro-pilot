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
          Politique de confidentialite
        </h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Derniere mise a jour : 19 fevrier 2026
      </p>

      <Card>
        <CardHeader>
          <CardTitle>1. Responsable du traitement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le responsable du traitement des donnees
            personnelles collectees via la plateforme CoproPilot
            est le syndic de copropriete utilisant cette
            application.
          </p>
          <p>
            Pour toute question relative a la protection de vos
            donnees, vous pouvez contacter le syndic via les
            coordonnees fournies dans votre contrat de syndic.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            2. Finalites du traitement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Vos donnees personnelles sont collectees et traitees
            pour les finalites suivantes :
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              Gestion de votre compte utilisateur et
              authentification
            </li>
            <li>
              Gestion de la copropriete (appels de fonds,
              charges, paiements)
            </li>
            <li>
              Communication relative aux assemblees generales
            </li>
            <li>Gestion des incidents et travaux</li>
            <li>Tenue de la comptabilite de la copropriete</li>
            <li>
              Respect des obligations legales du syndic (loi du
              10 juillet 1965, loi ALUR, loi ELAN)
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Base legale du traitement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le traitement de vos donnees repose sur les bases
            legales suivantes :
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Execution du contrat</strong> : gestion de
              votre qualite de coproprietaire et des obligations
              associees
            </li>
            <li>
              <strong>Obligation legale</strong> : tenue
              comptable (Code de commerce art. L123-22),
              registre national des coproprietes, obligations du
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
            4. Donnees collectees
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Identite</strong> : nom, prenom, adresse
              email
            </li>
            <li>
              <strong>Coordonnees</strong> : telephone, adresse
              de correspondance
            </li>
            <li>
              <strong>Donnees financieres</strong> : paiements,
              charges, appels de fonds
            </li>
            <li>
              <strong>Donnees de connexion</strong> : identifiant
              de session (cookie technique)
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Duree de conservation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Donnees de compte</strong> : conservees
              pendant la duree de votre qualite de
              coproprietaire, puis anonymisees sur demande
            </li>
            <li>
              <strong>Donnees financieres</strong> : conservees
              10 ans conformement au Code de commerce (art.
              L123-22)
            </li>
            <li>
              <strong>Donnees de session</strong> : supprimees a
              expiration de la session
            </li>
            <li>
              <strong>Notifications</strong> : conservees 1 an
              apres lecture
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
            Conformement au RGPD, vous disposez des droits
            suivants :
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Droit d&apos;acces</strong> : consulter
              l&apos;ensemble de vos donnees via votre espace
              personnel
            </li>
            <li>
              <strong>Droit de rectification</strong> : modifier
              vos coordonnees depuis votre profil
            </li>
            <li>
              <strong>Droit a la portabilite</strong> :
              telecharger vos donnees au format JSON depuis votre
              espace &laquo; Mes donnees personnelles &raquo;
            </li>
            <li>
              <strong>Droit a l&apos;effacement</strong> :
              demander la suppression de votre compte (les
              donnees financieres seront anonymisees mais
              conservees conformement a la loi)
            </li>
            <li>
              <strong>Droit d&apos;opposition</strong> : vous
              opposer au traitement de vos donnees a des fins
              marketing
            </li>
            <li>
              <strong>Droit de retrait du consentement</strong>{' '}
              : retirer vos consentements a tout moment depuis
              votre espace personnel
            </li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, rendez-vous dans la section
            &laquo; Mes donnees personnelles &raquo; de votre
            espace utilisateur, ou contactez votre syndic.
          </p>
          <p>
            Vous pouvez egalement introduire une reclamation
            aupres de la CNIL (Commission Nationale de
            l&apos;Informatique et des Libertes) sur{' '}
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
            necessaires au fonctionnement du service
            (authentification de session). Aucun cookie
            publicitaire ou de pistage n&apos;est utilise.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Securite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Nous mettons en oeuvre des mesures techniques et
            organisationnelles appropriees pour proteger vos
            donnees personnelles : chiffrement des mots de passe,
            controle d&apos;acces par roles, journalisation des
            acces, en-tetes de securite HTTP.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
