import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
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
    subtitle: 'Pilotage & visibilite',
    icon: Shield,
    accentColor: 'text-blue-700 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    borderAccent: 'group-hover:border-t-blue-400',
    bullets: [
      {
        icon: LayoutDashboard,
        text: 'Dashboard actionnable depuis un seul ecran',
      },
      {
        icon: ListChecks,
        text: 'Taches auto-generees : contrats, diagnostics, AG',
      },
      {
        icon: BellRing,
        text: 'Notifications temps reel instantanees',
      },
    ],
  },
  {
    title: 'Gerez les incidents de A a Z',
    subtitle: 'Maintenance & suivi',
    icon: Wrench,
    accentColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-50 dark:bg-orange-950/40',
    borderAccent: 'group-hover:border-t-orange-400',
    bullets: [
      {
        icon: FileText,
        text: "Ordres de service du signalement a la resolution",
      },
      {
        icon: Clock,
        text: 'Timeline complete de chaque intervention',
      },
    ],
  },
  {
    title: 'Maitrisez vos finances',
    subtitle: 'Comptabilite & tresorerie',
    icon: TrendingUp,
    accentColor: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderAccent: 'group-hover:border-t-emerald-400',
    bullets: [
      {
        icon: ArrowLeftRight,
        text: 'Reconciliation bancaire intelligente',
      },
      {
        icon: Calculator,
        text: 'Regularisation post-AG en 1 clic',
      },
      {
        icon: BarChart3,
        text: 'Previsions de tresorerie a 30, 60 et 90 jours',
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
        <motion.div
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
            Fonctionnalites
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
            Trois piliers pour gerer vos coproprietes
            en toute serenite
          </p>
        </motion.div>

        <div
          className="grid grid-cols-1 md:grid-cols-3
            gap-6 lg:gap-8"
        >
          {featureGroups.map((group, index) => {
            const GroupIcon = group.icon
            return (
              <motion.div
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
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
