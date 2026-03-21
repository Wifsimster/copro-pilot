import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import {
  UserPlus,
  Building2,
  LayoutDashboard,
} from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Créez votre compte',
    description:
      'Inscription gratuite en 30 secondes, sans carte bancaire.',
  },
  {
    number: '02',
    icon: Building2,
    title: 'Ajoutez votre copropriété',
    description:
      'Renseignez les informations de base : adresse, lots,'
      + ' copropriétaires.',
  },
  {
    number: '03',
    icon: LayoutDashboard,
    title: 'Gérez tout depuis un tableau de bord',
    description:
      'Comptabilité, incidents, AG, documents —'
      + ' tout est centralisé.',
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
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
          <h2
            className="font-display text-3xl sm:text-4xl
              font-semibold text-stone-900
              dark:text-stone-50"
          >
            Opérationnel en 5 minutes
          </h2>
          <p
            className="mt-3 text-stone-500
              dark:text-stone-400"
          >
            Pas de formation, pas d'installation,
            pas de prise de tête
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div
            className="hidden md:block absolute top-10
              left-[16.67%] right-[16.67%] h-px
              bg-gradient-to-r from-stone-200 via-emerald-300
              to-stone-200 dark:from-stone-800
              dark:via-emerald-700 dark:to-stone-800"
          />

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
          >
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 24 }}
                  animate={
                    isInView ? { opacity: 1, y: 0 } : {}
                  }
                  transition={{
                    delay: index * 0.15,
                    duration: 0.5,
                  }}
                  className="text-center relative"
                >
                  <div className="relative mx-auto mb-5">
                    <div
                      className="mx-auto flex size-20
                        items-center justify-center rounded-2xl
                        bg-[#FAF8F5] dark:bg-stone-950 border
                        border-stone-200/60
                        dark:border-stone-800"
                    >
                      <Icon
                        className="size-8 text-emerald-700
                          dark:text-emerald-400"
                      />
                    </div>
                    <span
                      className="absolute -top-2 -right-2
                        flex size-8 items-center justify-center
                        rounded-full bg-emerald-700
                        dark:bg-emerald-600 text-white
                        text-xs font-bold font-body"
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3
                    className="font-display text-xl
                      font-semibold text-stone-900
                      dark:text-white mb-2"
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-stone-500
                      dark:text-stone-400 max-w-xs mx-auto
                      leading-relaxed"
                  >
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
