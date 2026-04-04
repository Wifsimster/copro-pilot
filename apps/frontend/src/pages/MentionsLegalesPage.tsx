import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function MentionsLegalesPage() {
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
        <h1 className="text-2xl font-bold">Mentions legales</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Derniere mise a jour : 4 avril 2026
      </p>

      <Card>
        <CardHeader>
          <CardTitle>1. Editeur du site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le site CoproPilot est edite par :
          </p>
          <ul className="list-none space-y-1">
            <li>
              <strong>Raison sociale :</strong> CoproPilot
            </li>
            <li>
              <strong>Email :</strong>{' '}
              <a
                href="mailto:contact@copropilot.fr"
                className="text-emerald-700 hover:underline"
              >
                contact@copropilot.fr
              </a>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Hebergement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le site est heberge en France. Les donnees sont
            stockees sur des serveurs situes en Union
            europeenne, conformement au RGPD.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            3. Propriete intellectuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le code source de CoproPilot est distribue sous
            licence AGPL-3.0. Le nom &laquo; CoproPilot
            &raquo;, le logo et les elements graphiques
            associes sont proteges et ne peuvent etre
            reproduits sans autorisation prealable.
          </p>
          <p>
            L&apos;ensemble des contenus redactionnels
            (textes, illustrations, images) presents sur le
            site sont proteges par le droit d&apos;auteur.
            Toute reproduction, meme partielle, est interdite
            sans accord prealable.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            4. Protection des donnees personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Conformement au Reglement General sur la
            Protection des Donnees (RGPD) et a la loi
            Informatique et Libertes, vous disposez de droits
            sur vos donnees personnelles. Pour en savoir plus,
            consultez notre{' '}
            <a
              href="/#/politique-confidentialite"
              className="text-emerald-700 hover:underline"
            >
              politique de confidentialite
            </a>
            .
          </p>
          <p>
            Pour exercer vos droits ou pour toute question
            relative a vos donnees, contactez-nous a{' '}
            <a
              href="mailto:contact@copropilot.fr"
              className="text-emerald-700 hover:underline"
            >
              contact@copropilot.fr
            </a>
            .
          </p>
          <p>
            Vous pouvez egalement introduire une reclamation
            aupres de la CNIL sur{' '}
            <span className="font-medium">www.cnil.fr</span>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Cookies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Le site utilise uniquement des cookies techniques
            strictement necessaires au fonctionnement du
            service (authentification de session). Aucun
            cookie publicitaire ou de suivi n&apos;est
            utilise.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            6. Limitation de responsabilite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            CoproPilot s&apos;efforce de fournir des
            informations fiables et a jour. Toutefois,
            l&apos;editeur ne saurait garantir l&apos;exactitude,
            la completude ou l&apos;actualite des informations
            diffusees sur le site. L&apos;utilisateur est seul
            responsable de l&apos;utilisation qu&apos;il fait
            des informations et services proposes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Droit applicable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Les presentes mentions legales sont soumises au
            droit francais. En cas de litige, les tribunaux
            francais seront seuls competents.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
