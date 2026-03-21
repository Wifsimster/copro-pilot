import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Github } from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  price: number | null
  description: string
  features: string[]
  cta: { label: string; href: string }
  badge?: string
  promoted?: boolean
  muted?: boolean
}

const tiers: PricingTier[] = [
  {
    id: 'gratuit',
    name: 'Cloud Gratuit',
    price: 0,
    description: 'Pour démarrer avec une copropriété',
    features: [
      '1 copropriété',
      "Jusqu'à 20 lots",
      'Gestion complète (CRUD)',
      'Dashboard & notifications',
      'Documents & incidents',
      'Données hébergées en France',
    ],
    cta: { label: 'Commencer gratuitement', href: '/#/login' },
  },
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 19,
    description: 'Pour une copropriété plus importante',
    features: [
      '1 copropriété',
      "Jusqu'à 50 lots",
      'Tout du plan Gratuit',
      'Assemblées générales & PV',
      'Exports PDF & Excel',
      'Comptabilité réglementaire',
    ],
    cta: {
      label: 'Essai gratuit',
      href: '/#/login?plan=essentiel',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    description: 'Pour les syndics gérant plusieurs immeubles',
    features: [
      "Jusqu'à 20 copropriétés",
      'Lots illimités',
      'Tout du plan Essentiel',
      'Réconciliation bancaire',
      'Workflows automatisés',
      'Temps réel (SSE)',
      'Cash flow prévisionnel',
    ],
    cta: {
      label: 'Essai gratuit',
      href: '/#/login?plan=pro',
    },
    badge: 'Populaire',
    promoted: true,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    price: 99,
    description: 'Pour les cabinets de syndic',
    features: [
      'Copropriétés illimitées',
      'Tout du plan Pro',
      'SSO (Azure AD)',
      'API & intégrations',
      'Audit trail complet',
      'SLA & support prioritaire',
      'Migration assistée',
    ],
    cta: {
      label: 'Essai gratuit',
      href: '/#/login?plan=entreprise',
    },
  },
]

function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={`relative rounded-xl border p-6 flex flex-col ${
        tier.promoted
          ? 'border-primary ring-2 ring-primary bg-white dark:bg-slate-950 shadow-lg md:scale-105 z-10'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950'
      } ${tier.muted ? 'opacity-80' : ''}`}
    >
      {tier.badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
          {tier.badge}
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {tier.name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tier.description}
        </p>
      </div>

      <div className="mb-6">
        {tier.price === 0 ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              0 €
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              / mois
            </span>
          </div>
        ) : tier.price !== null ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-slate-900 dark:text-white">
              {tier.price} €
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              / mois
            </span>
          </div>
        ) : (
          <div className="text-4xl font-bold text-slate-900 dark:text-white">
            Sur devis
          </div>
        )}
      </div>

      <Button
        asChild
        className={`w-full mb-6 ${
          tier.promoted
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : ''
        }`}
        variant={tier.promoted ? 'default' : 'outline'}
      >
        <a href={tier.cta.href}>{tier.cta.label}</a>
      </Button>

      <ul className="space-y-3 flex-1">
        {tier.features.map(feature => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="size-4 mt-0.5 shrink-0 text-green-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
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

  return (
    <section
      id="tarifs"
      className="py-16 sm:py-24 bg-white dark:bg-slate-950"
    >
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Des tarifs simples et transparents
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Commencez gratuitement, évoluez quand vous êtes prêt.
            Sans engagement, sans carte bancaire.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center text-sm text-green-600 dark:text-green-400 font-medium mb-10"
        >
          Soit à partir de 0,38 €/lot/mois — jusqu'à 10x moins cher
          que les logiciels traditionnels
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 items-start">
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
              <PricingCard tier={tier} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 text-center space-y-3"
        >
          <a
            href="https://github.com/Wifsimster/immo-ia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <Github className="size-4" />
            Développeurs ? Découvrez la version auto-hébergée
            (Community, gratuite et open-source)
          </a>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Besoin d'un devis personnalisé ?{' '}
            <a
              href="mailto:contact@copropilot.fr"
              className="underline hover:text-slate-600 dark:hover:text-slate-300"
            >
              Contactez-nous
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
