import { useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Check, Github, Users } from 'lucide-react'
import { PricingCalculator } from './PricingCalculator'

type Cadence = 'monthly' | 'yearly'

interface PricingTier {
  id: string
  name: string
  price: { monthly: number; yearly: number } | null
  description: string
  features: string[]
  included: { coproprietes: string; users: string }
  overage?: string
  cta: { label: string; href: string }
  badge?: string
  promoted?: boolean
}

const tiers: PricingTier[] = [
  {
    id: 'gratuit',
    name: 'Cloud Gratuit',
    price: null,
    description: 'Pour démarrer avec une copropriété',
    included: { coproprietes: '1 copropriété', users: '3 utilisateurs' },
    features: [
      "Jusqu'à 20 lots",
      'Gestion complète (CRUD)',
      'Dashboard & notifications',
      'Documents & incidents',
      'Données hébergées en France',
    ],
    cta: {
      label: 'Commencer gratuitement',
      href: '/login',
    },
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: { monthly: 19, yearly: 144 },
    description: 'Pour une copropriété plus importante',
    included: {
      coproprietes: '3 copropriétés',
      users: '5 utilisateurs',
    },
    features: [
      'Lots illimités',
      'Tout du plan Gratuit',
      'Assemblées générales & PV',
      'Exports PDF & Excel',
      'Comptabilité réglementaire',
    ],
    cta: {
      label: 'Essai gratuit',
      href: '/login?plan=essentiel',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 49, yearly: 375 },
    description: 'Pour les syndics gérant plusieurs immeubles',
    included: {
      coproprietes: '20 copropriétés',
      users: '10 utilisateurs',
    },
    overage: '+3 €/copro, +5 €/utilisateur supplémentaire',
    features: [
      'Lots illimités',
      'Tout du plan Essentiel',
      'Réconciliation bancaire',
      'Workflows automatisés',
      'Temps réel (SSE)',
      'Cash flow prévisionnel',
    ],
    cta: {
      label: 'Essai gratuit',
      href: '/login?plan=pro',
    },
    badge: 'Populaire',
    promoted: true,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: { monthly: 149, yearly: 1140 },
    description: 'Pour les cabinets de syndic',
    included: {
      coproprietes: '50 copropriétés',
      users: '25 utilisateurs',
    },
    overage: '+2 €/copro, +4 €/utilisateur supplémentaire',
    features: [
      'Tout du plan Pro',
      'SSO (Azure AD)',
      'API & intégrations',
      'Audit trail complet',
      'SLA & support prioritaire',
      'Migration assistée',
    ],
    cta: {
      label: 'Essai gratuit',
      href: '/login?plan=entreprise',
    },
  },
]

function ctaHrefFor(tier: PricingTier, cadence: Cadence): string {
  if (!tier.price) return tier.cta.href
  const sep = tier.cta.href.includes('?') ? '&' : '?'
  return `${tier.cta.href}${sep}cadence=${cadence}`
}

function PricingCard({
  tier,
  cadence,
}: {
  tier: PricingTier
  cadence: Cadence
}) {
  return (
    <div
      className={`relative rounded-xl flex flex-col
        transition-all duration-300 ${
          tier.promoted
            ? 'border-2 border-emerald-600'
              + ' dark:border-emerald-500 bg-white'
              + ' dark:bg-stone-950 shadow-xl'
              + ' shadow-emerald-700/10'
              + ' dark:shadow-emerald-600/10'
              + ' md:scale-105 z-10'
            : 'border border-stone-200/60'
              + ' dark:border-stone-800 bg-white'
              + ' dark:bg-stone-950'
              + ' hover:shadow-md'
              + ' dark:hover:shadow-stone-950/50'
        } p-6`}
    >
      {tier.badge && (
        <span
          className="absolute -top-3 left-1/2
            -translate-x-1/2 inline-flex items-center
            rounded-full bg-amber-500 dark:bg-amber-400
            px-3 py-0.5 text-xs font-bold text-white
            dark:text-stone-950 tracking-wide"
        >
          {tier.badge}
        </span>
      )}

      <div className="mb-4">
        <h3
          className="text-lg font-semibold text-stone-900
            dark:text-white"
        >
          {tier.name}
        </h3>
        <p
          className="text-sm text-stone-400
            dark:text-stone-500 mt-1"
        >
          {tier.description}
        </p>
      </div>

      <div className="mb-6">
        {tier.id === 'gratuit' ? (
          <div className="flex items-baseline gap-1">
            <span
              className="font-display text-5xl font-bold
                text-stone-900 dark:text-white"
            >
              0 €
            </span>
            <span
              className="text-sm text-stone-400
                dark:text-stone-500"
            >
              / mois
            </span>
          </div>
        ) : tier.price ? (
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span
                className="font-display text-5xl font-bold
                  text-stone-900 dark:text-white"
              >
                {cadence === 'yearly'
                  ? tier.price.yearly
                  : tier.price.monthly}{' '}
                €
              </span>
              <span
                className="text-sm text-stone-400
                  dark:text-stone-500"
              >
                {cadence === 'yearly' ? '/ an' : '/ mois'}
              </span>
            </div>
            {cadence === 'yearly' && (
              <p
                className="text-xs text-emerald-600
                  dark:text-emerald-400 font-medium"
              >
                Soit {Math.round(tier.price.yearly / 12)} €/mois
                - économisez{' '}
                {Math.round(
                  (1 - tier.price.yearly / (tier.price.monthly * 12))
                    * 100
                )}{' '}
                %
              </p>
            )}
          </div>
        ) : (
          <div
            className="font-display text-5xl font-bold
              text-stone-900 dark:text-white"
          >
            Sur devis
          </div>
        )}
      </div>

      <div
        className="mb-4 rounded-lg bg-stone-50 dark:bg-stone-900
          p-3 space-y-1.5"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium text-stone-700
              dark:text-stone-300"
          >
            {tier.included.coproprietes}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users
            className="size-3.5 text-emerald-500
              dark:text-emerald-400"
          />
          <span
            className="text-sm font-medium text-stone-700
              dark:text-stone-300"
          >
            {tier.included.users} inclus
          </span>
        </div>
        {tier.overage && (
          <p
            className="text-xs text-stone-400
              dark:text-stone-500 pt-0.5"
          >
            {tier.overage}
          </p>
        )}
      </div>

      <Button
        asChild
        className={`w-full mb-6 rounded-lg ${
          tier.promoted
            ? 'bg-emerald-700 hover:bg-emerald-800'
              + ' dark:bg-emerald-600'
              + ' dark:hover:bg-emerald-700 text-white'
              + ' shadow-lg shadow-emerald-700/20'
            : ''
        }`}
        variant={tier.promoted ? 'default' : 'outline'}
      >
        <a href={ctaHrefFor(tier, cadence)}>{tier.cta.label}</a>
      </Button>

      <ul className="space-y-3 flex-1">
        {tier.features.map(feature => (
          <li
            key={feature}
            className="flex items-start gap-2.5"
          >
            <Check
              className="size-4 mt-0.5 shrink-0
                text-emerald-500 dark:text-emerald-400"
            />
            <span
              className="text-sm text-stone-600
                dark:text-stone-400"
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PricingSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [cadence, setCadence] = useState<Cadence>('monthly')

  return (
    <section
      id="tarifs"
      className="py-20 sm:py-28 bg-[#FAF8F5]
        dark:bg-stone-950"
    >
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <p
            className="text-sm font-semibold uppercase
              tracking-widest text-emerald-700
              dark:text-emerald-400 mb-3"
          >
            Tarifs
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl
              font-semibold text-stone-900
              dark:text-stone-50"
          >
            Des tarifs simples et transparents
          </h2>
          <p
            className="mt-4 text-stone-500
              dark:text-stone-400 max-w-2xl mx-auto"
          >
            Commencez gratuitement, évoluez quand vous êtes
            prêt. Sans engagement, sans carte bancaire.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center text-sm text-amber-600
            dark:text-amber-400 font-semibold mb-8"
        >
          Soit à partir de 0,38 €/lot/mois - jusqu'à 10x
          moins cher que les logiciels traditionnels
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex justify-center mb-12"
        >
          <div
            className="inline-flex items-center rounded-full
              border border-stone-200 dark:border-stone-700
              bg-white dark:bg-stone-900 p-1 text-sm shadow-sm"
            role="group"
            aria-label="Cadence de facturation"
          >
            <button
              type="button"
              onClick={() => setCadence('monthly')}
              className={`px-4 py-1.5 rounded-full transition ${
                cadence === 'monthly'
                  ? 'bg-stone-900 dark:bg-stone-100'
                    + ' text-white dark:text-stone-900'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              Mensuel
            </button>
            <button
              type="button"
              onClick={() => setCadence('yearly')}
              className={`px-4 py-1.5 rounded-full transition
                flex items-center gap-2 ${
                  cadence === 'yearly'
                    ? 'bg-stone-900 dark:bg-stone-100'
                      + ' text-white dark:text-stone-900'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
            >
              Annuel
              <span
                className={`text-xs font-semibold rounded-full
                  px-2 py-0.5 ${
                    cadence === 'yearly'
                      ? 'bg-emerald-500/20'
                        + ' text-emerald-200'
                      : 'bg-emerald-100 dark:bg-emerald-900/40'
                        + ' text-emerald-700'
                        + ' dark:text-emerald-400'
                  }`}
              >
                −36 %
              </span>
            </button>
          </div>
        </motion.div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2
            lg:grid-cols-4 gap-6 lg:gap-4 items-start"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: index * 0.08,
                duration: 0.5,
              }}
            >
              <PricingCard tier={tier} cadence={cadence} />
            </motion.div>
          ))}
        </div>

        <PricingCalculator />

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 text-center space-y-3"
        >
          <a
            href="https://github.com/Wifsimster/copro-pilot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm
              text-stone-400 dark:text-stone-500
              hover:text-stone-600 dark:hover:text-stone-300
              transition-colors"
          >
            <Github className="size-4" />
            Développeurs ? Découvrez la version auto-hébergée
            (Community, gratuite et open-source)
          </a>
          <p
            className="text-xs text-stone-400
              dark:text-stone-500"
          >
            Besoin d'un devis personnalisé ?{' '}
            <a
              href="mailto:contact@copropilot.fr"
              className="underline hover:text-stone-600
                dark:hover:text-stone-300"
            >
              Contactez-nous
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
