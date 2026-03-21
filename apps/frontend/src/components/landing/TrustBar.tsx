import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Shield, MapPin, Headphones, Code2 } from 'lucide-react'

const trustItems = [
  {
    icon: Shield,
    label: 'Conforme RGPD',
  },
  {
    icon: MapPin,
    label: 'Données hébergées en France',
  },
  {
    icon: Code2,
    label: 'Code source auditable',
  },
  {
    icon: Headphones,
    label: 'Support humain réactif',
  },
]

export function TrustBar() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section className="py-8 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800">
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10"
        >
          {trustItems.map(item => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-2 text-slate-500 dark:text-slate-400"
              >
                <Icon className="size-4 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
