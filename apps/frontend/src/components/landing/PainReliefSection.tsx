import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Clock, Bell, CheckCircle } from 'lucide-react'

const painPoints = [
  {
    before: 'Chercher dans 15 classeurs',
    after: 'Tout dans une timeline',
    icon: Clock,
  },
  {
    before: 'Relancer les coproprietaires a la main',
    after: 'Rappels automatiques',
    icon: Bell,
  },
  {
    before: 'Tableur Excel pour la compta',
    after: 'Reconciliation en 1 clic',
    icon: CheckCircle,
  },
]

export function PainReliefSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950">
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12"
        >
          Fini les galeres du quotidien
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => {
            const Icon = point.icon
            return (
              <motion.div
                key={point.after}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="text-center px-4"
              >
                <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                  <Icon className="size-7 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-base text-red-400 line-through mb-2">
                  {point.before}
                </p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {point.after}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
