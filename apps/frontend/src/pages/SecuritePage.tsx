import {
  ShieldCheck,
  Lock,
  ScrollText,
  KeyRound,
  FileLock2,
  Github,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { SEOHead } from '@/components/SEO/SEOHead'
import { SITE_URL } from '@/lib/siteUrl'

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Hébergement et résidence des données',
    bullets: [
      'Données hébergées exclusivement en France, chez un hébergeur certifié, conformément au RGPD.',
      'Aucun transfert hors UE pour les données personnelles des copropriétaires.',
      'Sauvegardes chiffrées quotidiennes avec rotation et conservation configurable.',
    ],
  },
  {
    icon: Lock,
    title: 'Chiffrement',
    bullets: [
      'TLS 1.2+ obligatoire pour toutes les communications client → serveur.',
      'Chiffrement AES-256-GCM en base pour les informations bancaires sensibles (IBAN).',
      'Mots de passe stockés en hash via les standards de Better Auth (bcrypt / scrypt).',
    ],
  },
  {
    icon: ScrollText,
    title: 'Journal d’audit infalsifiable',
    bullets: [
      'Chaîne de hachage SHA-256 sur chaque écriture sensible : impossible d’altérer un événement sans casser la chaîne.',
      'Endpoint /api/audit/verify-chain pour qu’un administrateur vérifie l’intégrité à tout moment.',
      'Identifiant de corrélation (X-Request-Id) propagé sur chaque requête pour tracer un incident bout en bout.',
    ],
  },
  {
    icon: KeyRound,
    title: 'Authentification & contrôle d’accès',
    bullets: [
      'Authentification gérée par Better Auth (email + mot de passe), verrouillage automatique après 5 échecs (fenêtre 15 minutes).',
      'Protection CSRF par double-submit cookie sur toutes les routes mutantes.',
      'Contrôle d’accès par rôle (syndic, user, copropriétaire) côté serveur — jamais uniquement côté client.',
    ],
  },
  {
    icon: FileLock2,
    title: 'RGPD & droits des personnes',
    bullets: [
      'Export complet de vos données en JSON (Article 20 du RGPD) accessible depuis votre compte.',
      'Effacement sur demande (Article 17) avec piste d’audit conservée pour les obligations légales.',
      'Sous-traitants documentés (DPA) ; aucun outil de tracking publicitaire embarqué dans le produit.',
    ],
  },
  {
    icon: Github,
    title: 'Transparence open core',
    bullets: [
      'Le code source du backend et du frontend est publiquement consultable sur GitHub.',
      'Vous (ou votre RSSI) pouvez auditer les flux de données, les middlewares et la stack avant de signer.',
      'Les CVE remontées par npm audit sont traitées dans la CI, pas dans des releases opaques.',
    ],
  },
]

const securityFaqs = [
  {
    question: 'Pouvez-vous signer un DPA / Avenant RGPD ?',
    answer:
      'Oui, pour les plans Entreprise. Pour les plans grand public, ' +
      'le contrat d’abonnement couvre déjà les engagements de l’article 28 ' +
      'du RGPD : finalités, durée, sécurité, sous-traitants ultérieurs.',
  },
  {
    question: 'Que se passe-t-il en cas d’incident de sécurité ?',
    answer:
      'Nous notifions les utilisateurs concernés dans les 72 heures ' +
      'conformément à l’article 33 du RGPD, et la CNIL si la gravité ' +
      'le justifie. Le journal d’audit permet de circonscrire ' +
      'précisément le périmètre touché.',
  },
  {
    question: 'Puis-je exporter mes données si je quitte CoproPilot ?',
    answer:
      'À tout moment. L’export RGPD couvre les copropriétés, lots, ' +
      'copropriétaires, charges, paiements, AG, documents, et historique ' +
      'd’audit. Le format JSON est suffisamment standard pour être ' +
      'réimporté dans la plupart des outils.',
  },
  {
    question: 'Est-ce qu’un administrateur CoproPilot peut lire mes données ?',
    answer:
      'Seul un nombre restreint d’ingénieurs y a un accès technique ' +
      'pour les besoins d’exploitation, et cet accès est tracé dans le ' +
      'journal d’audit. Aucun accès commercial ou marketing n’est ' +
      'autorisé sur les données métier.',
  },
]

const securityJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Sécurité et conformité — CoproPilot',
    url: `${SITE_URL}/securite`,
    description:
      'Comment CoproPilot protège les données des copropriétés : hébergement France, chiffrement AES-256, journal d’audit infalsifiable, conformité RGPD, code source auditable.',
    inLanguage: 'fr-FR',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: securityFaqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  },
]

export default function SecuritePage() {
  return (
    <div className="min-h-screen font-body antialiased">
      <SEOHead
        title="Sécurité et conformité RGPD — CoproPilot"
        description="Comment CoproPilot sécurise vos données de copropriété : hébergement France, chiffrement AES-256, journal d’audit infalsifiable, conformité RGPD (Art. 17 et 20), code source auditable sur GitHub."
        canonical="/securite"
        jsonLd={securityJsonLd}
      />
      <LandingHeader />

      <section className="pt-32 pb-16 bg-[#FAF8F5] dark:bg-stone-950">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-4">
            Sécurité &amp; conformité
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.1]">
            Vos données de copropriété,{' '}
            <span className="italic text-emerald-700 dark:text-emerald-400">
              en France
            </span>{' '}
            et auditables.
          </h1>
          <p className="mt-6 text-lg text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Hébergement en France, chiffrement de bout en bout, journal
            d’audit infalsifiable, code source publiquement auditable.
            Voici concrètement comment nous protégeons les informations
            que vous nous confiez.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-stone-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map(pillar => {
              const Icon = pillar.icon
              return (
                <article
                  key={pillar.title}
                  className="rounded-2xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-950/40 p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center size-10 rounded-lg bg-emerald-700/10 dark:bg-emerald-600/10">
                      <Icon className="size-5 text-emerald-700 dark:text-emerald-400" />
                    </span>
                    <h2 className="font-display text-xl font-semibold text-stone-900 dark:text-stone-50">
                      {pillar.title}
                    </h2>
                  </div>
                  <ul className="space-y-2.5">
                    {pillar.bullets.map(bullet => (
                      <li
                        key={bullet}
                        className="text-sm text-muted-foreground leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-emerald-500"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#FAF8F5] dark:bg-stone-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-50 text-center mb-10">
            Questions de sécurité fréquentes
          </h2>
          <div className="rounded-xl border border-stone-200/60 dark:border-stone-800 bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-800">
            {securityFaqs.map(faq => (
              <details
                key={faq.question}
                className="group px-6 py-5"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="font-display text-base font-medium text-stone-900 dark:text-stone-50">
                    {faq.question}
                  </span>
                  <span className="text-stone-400 transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-stone-900">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 dark:text-stone-50">
            Une question sécurité spécifique ?
          </h2>
          <p className="mt-4 text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
            Écrivez-nous, nous répondons sous 48 h ouvrées. Pour les
            audits formels (RSSI, DPO), nous fournissons sur demande un
            mémo technique détaillant la stack et les flux de données.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-base px-8 h-12 rounded-xl group"
            >
              <a href="mailto:security@copropilot.fr">
                Contacter l’équipe sécurité
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild className="text-base h-12 rounded-xl">
              <a
                href="https://github.com/Wifsimster/copro-pilot"
                target="_blank"
                rel="noopener noreferrer"
              >
                Voir le code sur GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
