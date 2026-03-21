import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { UserPlus, Building2, Rocket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Step {
  number: number
  title: string
  description: string
  icon: LucideIcon
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Creez votre compte',
    description: 'Inscription gratuite en 2 minutes',
    icon: UserPlus,
  },
  {
    number: 2,
    title: 'Ajoutez vos coproprietes',
    description: 'Importez ou saisissez vos donnees',
    icon: Building2,
  },
  {
    number: 3,
    title: 'Pilotez en toute serenite',
    description: 'Incidents, AG, comptabilite — tout est pret',
    icon: Rocket,
  },
]

export function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="comment-ca-marche"
      className="py-16 sm:py-24 bg-white dark:bg-slate-950"
    >
      <div ref={ref} className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-16"
        >
          Pret en 3 etapes
        </motion.h2>

        {/* Desktop horizontal stepper */}
        <div className="hidden md:block">
          <div className="relative flex items-start justify-between">
            {/* Connecting line */}
            <div className="absolute top-6 left-[calc(16.67%)] right-[calc(16.67%)] h-0.5 bg-slate-200 dark:bg-slate-700" />

            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    delay: index * 0.2,
                    duration: 0.5,
                  }}
                  className="relative flex flex-col items-center text-center w-1/3 px-4"
                >
                  <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg shadow-md">
                    {step.number}
                  </div>
                  <div className="mt-4 flex size-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Icon className="size-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {step.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Mobile vertical stepper */}
        <div className="md:hidden">
          <div className="relative space-y-8 pl-10">
            {/* Vertical connecting line */}
            <div className="absolute top-0 bottom-0 left-[1.1rem] w-0.5 bg-slate-200 dark:bg-slate-700" />

            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{
                    delay: index * 0.2,
                    duration: 0.5,
                  }}
                  className="relative flex items-start gap-4"
                >
                  <div className="absolute -left-10 flex size-9 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm shadow-md">
                    {step.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="size-4 text-blue-600 dark:text-blue-400" />
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
