import { useRef } from 'react'
import { m, useInView } from 'motion/react'
import {
  Shield,
  Wrench,
  TrendingUp,
  LayoutDashboard,
  ListChecks,
  BellRing,
  FileText,
  Clock,
  ArrowLeftRight,
  Calculator,
  BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface FeatureBullet {
  icon: LucideIcon
  text: string
}

interface FeatureGroup {
  title: string
  subtitle: string
  icon: LucideIcon
  accentColor: string
  iconBg: string
  borderAccent: string
  bullets: FeatureBullet[]
}

const featureGroups: FeatureGroup[] = [
  {
    title: 'Ne ratez plus rien',
    subtitle: 'Pilotage & visibilité',
    icon: Shield,
    accentColor: 'text-emerald-800 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderAccent: 'group-hover:border-t-emerald-400',
    bullets: [
      {
        icon: LayoutDashboard,
        text: 'Dashboard actionnable depuis un seul écran',
      },
      {
        icon: ListChecks,
        text: 'Tâches auto-générées : contrats, diagnostics, AG',
      },
      {
        icon: BellRing,
        text: 'Notifications temps réel instantanées',
      },
    ],
  },
  {
    title: 'Gérez les incidents de A à Z',
    subtitle: 'Maintenance & suivi',
    icon: Wrench,
    accentColor: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderAccent: 'group-hover:border-t-emerald-400',
    bullets: [
      {
        icon: FileText,
        text: "Ordres de service du signalement à la résolution",
      },
      {
        icon: Clock,
        text: 'Timeline complète de chaque intervention',
      },
    ],
  },
  {
    title: 'Maîtrisez vos finances',
    subtitle: 'Comptabilité & trésorerie',
    icon: TrendingUp,
    accentColor: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderAccent: 'group-hover:border-t-emerald-400',
    bullets: [
      {
        icon: ArrowLeftRight,
        text: 'Réconciliation bancaire intelligente',
      },
      {
        icon: Calculator,
        text: 'Régularisation post-AG en 1 clic',
      },
      {
        icon: BarChart3,
        text: 'Prévisions de trésorerie à 30, 60 et 90 jours',
      },
    ],
  },
]

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="fonctionnalites"
      className="py-20 sm:py-28 bg-white dark:bg-stone-900"
    >
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p
            className="text-sm font-semibold uppercase
              tracking-widest text-emerald-700
              dark:text-emerald-400 mb-3"
          >
            Fonctionnalités
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl
              font-semibold text-stone-900
              dark:text-stone-50"
          >
            Tout ce dont vous avez besoin
          </h2>
          <p
            className="mt-4 text-stone-500
              dark:text-stone-400 max-w-2xl mx-auto"
          >
            Trois piliers pour gérer vos copropriétés
            en toute sérénité
          </p>
        </m.div>

        <div
          className="grid grid-cols-1 md:grid-cols-3
            gap-6 lg:gap-8"
        >
          {featureGroups.map((group, index) => {
            const GroupIcon = group.icon
            return (
              <m.div
                key={group.title}
                initial={{ opacity: 0, y: 30 }}
                animate={
                  isInView ? { opacity: 1, y: 0 } : {}
                }
                transition={{
                  delay: index * 0.15,
                  duration: 0.5,
                }}
                className={`group rounded-xl border-t-2
                  border-t-transparent border
                  border-stone-200/60 dark:border-stone-800
                  bg-[#FAF8F5] dark:bg-stone-950 p-6
                  transition-all duration-300
                  hover:shadow-lg
                  dark:hover:shadow-stone-950/50
                  ${group.borderAccent}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`flex size-11 items-center
                      justify-center rounded-xl ${group.iconBg}`}
                  >
                    <GroupIcon
                      className={`size-5 ${group.accentColor}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`text-base font-semibold
                        ${group.accentColor}`}
                    >
                      {group.title}
                    </h3>
                    <p
                      className="text-xs text-stone-400
                        dark:text-stone-500"
                    >
                      {group.subtitle}
                    </p>
                  </div>
                </div>

                <ul className="space-y-3">
                  {group.bullets.map(bullet => {
                    const BulletIcon = bullet.icon
                    return (
                      <li
                        key={bullet.text}
                        className="flex items-start gap-3"
                      >
                        <BulletIcon
                          className="size-4 mt-0.5 shrink-0
                            text-stone-400 dark:text-stone-500"
                        />
                        <span
                          className="text-sm text-stone-600
                            dark:text-stone-400 leading-relaxed"
                        >
                          {bullet.text}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </m.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
