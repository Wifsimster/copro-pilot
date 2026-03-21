import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { UserPlus, Building2, LayoutDashboard } from 'lucide-react'

const steps = [
  {
    number: '1',
    icon: UserPlus,
    title: 'Créez votre compte',
    description: 'Inscription gratuite en 30 secondes, sans carte bancaire.',
  },
  {
    number: '2',
    icon: Building2,
    title: 'Ajoutez votre copropriété',
    description:
      'Renseignez les informations de base : adresse, lots, copropriétaires.',
  },
  {
    number: '3',
    icon: LayoutDashboard,
    title: 'Gérez tout depuis un tableau de bord',
    description:
      'Comptabilité, incidents, AG, documents — tout est centralisé.',
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Opérationnel en 5 minutes
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Pas de formation, pas d'installation, pas de prise de tête
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="relative mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="size-7 text-primary" />
                  <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
