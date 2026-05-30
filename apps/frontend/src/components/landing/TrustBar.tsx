import { useRef } from 'react'
import { m, useInView } from 'motion/react'
import { Shield, MapPin, Headphones, Code2 } from 'lucide-react'

const trustItems = [
  { icon: Shield, label: 'Conforme RGPD' },
  { icon: MapPin, label: 'Hébergé en France' },
  { icon: Code2, label: 'Code auditable' },
  { icon: Headphones, label: 'Support réactif' },
]

export function TrustBar() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <section className="relative py-6 bg-white dark:bg-stone-900">
      <div className="landing-line h-px w-full absolute top-0" />
      <div
        ref={ref}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center
            gap-x-10 gap-y-4"
        >
          {trustItems.map(item => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5
                  text-stone-400 dark:text-stone-500"
              >
                <Icon className="size-4 shrink-0
                  text-emerald-600/60 dark:text-emerald-500/50"
                />
                <span className="text-sm font-medium
                  tracking-wide"
                >
                  {item.label}
                </span>
              </div>
            )
          })}
        </m.div>
      </div>
      <div className="landing-line h-px w-full absolute bottom-0" />
    </section>
  )
}
