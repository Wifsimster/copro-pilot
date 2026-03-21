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
  icon: LucideIcon
  accentColor: string
  iconBg: string
  bullets: FeatureBullet[]
}

const featureGroups: FeatureGroup[] = [
  {
    title: 'Ne ratez plus rien',
    icon: Shield,
    accentColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-950/50',
    bullets: [
      {
        icon: LayoutDashboard,
        text: 'Dashboard actionnable : agissez depuis un seul ecran',
      },
      {
        icon: ListChecks,
        text: 'Taches auto-generees : rappels pour contrats, diagnostics, AG',
      },
      {
        icon: BellRing,
        text: 'Notifications temps reel : informations instantanees',
      },
    ],
  },
  {
    title: 'Gerez les incidents de A a Z',
    icon: Wrench,
    accentColor: 'text-orange-600 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-950/50',
    bullets: [
      {
        icon: FileText,
        text: "Ordres de service : workflow guide de l'incident a la resolution",
      },
      {
        icon: Clock,
        text: 'Timeline : historique complet de chaque intervention',
      },
    ],
  },
  {
    title: 'Maitrisez vos finances',
    icon: TrendingUp,
    accentColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-950/50',
    bullets: [
      {
        icon: ArrowLeftRight,
        text: 'Reconciliation bancaire : matching intelligent des mouvements',
      },
      {
        icon: Calculator,
        text: 'Regularisation post-AG : budget et appels de fonds en 1 clic',
      },
      {
        icon: BarChart3,
        text: 'Cash flow : previsions de tresorerie a 30, 60 et 90 jours',
      },
    ],
  },
]

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="fonctionnalites"
      className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900"
    >
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Tout ce dont vous avez besoin
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Trois piliers pour gerer vos coproprietes en toute serenite
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {featureGroups.map((group, index) => {
            const GroupIcon = group.icon
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-6 transition-shadow hover:shadow-sm"
              >
                <div
                  className={`mb-4 flex size-12 items-center justify-center rounded-lg ${group.iconBg}`}
                >
                  <GroupIcon className={`size-6 ${group.accentColor}`} />
                </div>
                <h3
                  className={`text-lg font-semibold mb-4 ${group.accentColor}`}
                >
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.bullets.map((bullet) => {
                    const BulletIcon = bullet.icon
                    return (
                      <li
                        key={bullet.text}
                        className="flex items-start gap-3"
                      >
                        <BulletIcon className="size-4 mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
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
