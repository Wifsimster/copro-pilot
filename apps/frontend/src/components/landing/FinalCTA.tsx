import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      className="relative py-24 sm:py-32 bg-stone-900
        dark:bg-stone-950 overflow-hidden"
    >
      {/* Decorative gradient orb */}
      <div
        className="absolute top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px]
          bg-emerald-600/8
          rounded-full blur-3xl pointer-events-none"
      />

      <div
        ref={ref}
        className="relative mx-auto max-w-3xl px-4
          sm:px-6 lg:px-8 text-center"
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl sm:text-4xl
            lg:text-5xl font-semibold text-white
            leading-tight"
        >
          Prêt à simplifier
          <br />
          <span
            className="italic text-emerald-400"
          >
            votre copropriété ?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-6 text-lg text-stone-400"
        >
          Rejoignez les syndics qui ont choisi la simplicité.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-10"
        >
          <Button
            asChild
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500
              text-white text-base px-10 h-13 rounded-xl
              shadow-lg shadow-emerald-600/30 group"
          >
            <a href="/#/login">
              Commencer gratuitement
              <ArrowRight
                className="size-4 ml-2 transition-transform
                  group-hover:translate-x-1"
              />
            </a>
          </Button>
          <p className="mt-5 text-sm text-stone-500">
            Sans engagement &middot; Sans carte bancaire
            &middot; Opérationnel en 5 min
          </p>
        </motion.div>
      </div>
    </section>
  )
}
