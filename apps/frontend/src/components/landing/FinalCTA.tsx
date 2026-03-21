import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950">
      <div ref={ref} className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white"
        >
          Prêt à simplifier votre copropriété ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mt-4 text-lg text-slate-600 dark:text-slate-400"
        >
          Rejoignez les syndics qui ont choisi la simplicité.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8"
        >
          <Button
            asChild
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-base px-10 h-12"
          >
            <a href="/#/login">Commencer gratuitement</a>
          </Button>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Sans engagement · Sans carte bancaire · Opérationnel en 5 min
          </p>
        </motion.div>
      </div>
    </section>
  )
}
