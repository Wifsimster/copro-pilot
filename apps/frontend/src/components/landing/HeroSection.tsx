import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import {
  Building2,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Bell,
  ArrowRight,
} from 'lucide-react'

function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -4, rotateX: 2 }}
      animate={{ opacity: 1, y: 0, rotateY: -4, rotateX: 2 }}
      transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-lg mx-auto lg:mx-0"
      style={{ perspective: '1200px' }}
    >
      <div
        className="rounded-2xl border border-stone-200/80
          dark:border-stone-700/60 bg-white dark:bg-stone-900
          shadow-[0_20px_60px_-12px_rgb(0,0,0,0.15)]
          dark:shadow-[0_20px_60px_-12px_rgb(0,0,0,0.5)]
          overflow-hidden"
      >
        {/* Browser chrome */}
        <div
          className="flex items-center gap-1.5 px-4 py-2.5
            bg-stone-100 dark:bg-stone-800
            border-b border-stone-200 dark:border-stone-700"
        >
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span
            className="size-2.5 rounded-full bg-emerald-400/80"
          />
          <span
            className="ml-3 text-[10px] text-stone-400
              dark:text-stone-500 font-medium tracking-wide"
          >
            app.copropilot.fr
          </span>
        </div>

        {/* Dashboard content */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div
              className="rounded-xl bg-emerald-50
                dark:bg-emerald-950/40 p-3 text-center"
            >
              <Building2
                className="size-4 mx-auto text-emerald-700
                  dark:text-emerald-400 mb-1"
              />
              <div
                className="text-lg font-bold text-stone-900
                  dark:text-white font-display"
              >
                12
              </div>
              <div
                className="text-[10px] text-stone-500
                  dark:text-stone-400"
              >
                Copropriétés
              </div>
            </div>
            <div
              className="rounded-xl bg-amber-50
                dark:bg-amber-950/40 p-3 text-center"
            >
              <AlertTriangle
                className="size-4 mx-auto text-amber-600
                  dark:text-amber-400 mb-1"
              />
              <div
                className="text-lg font-bold text-stone-900
                  dark:text-white font-display"
              >
                3
              </div>
              <div
                className="text-[10px] text-stone-500
                  dark:text-stone-400"
              >
                Incidents
              </div>
            </div>
            <div
              className="rounded-xl bg-emerald-50
                dark:bg-emerald-950/40 p-3 text-center"
            >
              <Calendar
                className="size-4 mx-auto text-emerald-700
                  dark:text-emerald-400 mb-1"
              />
              <div
                className="text-lg font-bold text-stone-900
                  dark:text-white font-display"
              >
                15 mars
              </div>
              <div
                className="text-[10px] text-stone-500
                  dark:text-stone-400"
              >
                Prochaine AG
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div
              className="text-[10px] font-semibold text-stone-400
                dark:text-stone-500 uppercase tracking-widest"
            >
              Tâches en cours
            </div>
            <div
              className="flex items-center gap-2 rounded-lg
                bg-stone-50 dark:bg-stone-800 p-2.5"
            >
              <CheckCircle
                className="size-3.5 text-emerald-500 shrink-0"
              />
              <span
                className="text-xs text-stone-600
                  dark:text-stone-300"
              >
                Relancer devis plomberie
              </span>
            </div>
            <div
              className="flex items-center gap-2 rounded-lg
                bg-stone-50 dark:bg-stone-800 p-2.5"
            >
              <CheckCircle
                className="size-3.5 text-stone-300
                  dark:text-stone-600 shrink-0"
              />
              <span
                className="text-xs text-stone-600
                  dark:text-stone-300"
              >
                Envoyer PV assemblée
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute -top-3 -right-4 sm:-right-8"
        style={{
          animation: 'float 4s ease-in-out infinite',
        }}
      >
        <div
          className="flex items-center gap-2 rounded-xl
            border border-amber-200 dark:border-amber-800/60
            bg-white dark:bg-stone-900
            shadow-lg dark:shadow-stone-950/50
            px-3 py-2"
        >
          <Bell className="size-3.5 text-amber-500 shrink-0" />
          <span
            className="text-[11px] text-amber-700
              dark:text-amber-300 font-medium whitespace-nowrap"
          >
            2 paiements en attente
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center
        overflow-hidden bg-[#FAF8F5] dark:bg-stone-950
        landing-dots pt-16"
    >
      {/* Decorative gradient orbs */}
      <div
        className="absolute top-20 -left-40 size-96
          bg-emerald-200/20 dark:bg-emerald-900/10
          rounded-full blur-3xl pointer-events-none"
      />
      <div
        className="absolute bottom-20 -right-40 size-96
          bg-amber-200/20 dark:bg-amber-900/10
          rounded-full blur-3xl pointer-events-none"
      />

      <div
        className="relative mx-auto max-w-7xl px-4 sm:px-6
          lg:px-8 py-16 sm:py-24"
      >
        <div
          className="grid lg:grid-cols-2 gap-12 lg:gap-20
            items-center"
        >
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5
                rounded-full border border-emerald-200
                dark:border-emerald-800/60 bg-emerald-50/80
                dark:bg-emerald-950/40 px-4 py-1.5
                text-sm font-medium text-emerald-700
                dark:text-emerald-400 mb-8"
            >
              <span className="relative flex size-2">
                <span
                  className="animate-ping absolute inline-flex
                    size-full rounded-full
                    bg-emerald-400 opacity-75"
                />
                <span
                  className="relative inline-flex size-2
                    rounded-full bg-emerald-500"
                />
              </span>
              Gratuit pour démarrer
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="font-display font-semibold
                tracking-tight text-stone-900
                dark:text-stone-50 leading-[1.1]"
            >
              <span className="text-4xl sm:text-5xl lg:text-6xl">
                Gérez vos copropriétés
              </span>
              <br />
              <span
                className="text-4xl sm:text-5xl lg:text-6xl
                  italic text-emerald-700 dark:text-emerald-400"
              >
                simplement.
              </span>
              <br />
              <span className="inline-flex items-baseline gap-3
                mt-2"
              >
                <span
                  className="text-6xl sm:text-7xl lg:text-8xl
                    font-bold text-amber-600
                    dark:text-amber-400"
                >
                  10&times;
                </span>
                <span
                  className="text-3xl sm:text-4xl lg:text-5xl
                    text-stone-400 dark:text-stone-500"
                >
                  moins cher.
                </span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-8 text-lg text-stone-500
                dark:text-stone-400 max-w-xl mx-auto
                lg:mx-0 leading-relaxed"
            >
              L'outil moderne pour syndics bénévoles et
              professionnels. Opérationnel en 5 minutes,
              sans installation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-4
                justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="bg-emerald-700 hover:bg-emerald-800
                  dark:bg-emerald-600 dark:hover:bg-emerald-700
                  text-white text-base px-8 h-12 rounded-xl
                  shadow-lg shadow-emerald-700/20
                  dark:shadow-emerald-600/20 group"
              >
                <a href="/login">
                  Essayer gratuitement
                  <ArrowRight
                    className="size-4 ml-2 transition-transform
                      group-hover:translate-x-1"
                  />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-base h-12 rounded-xl
                  border-stone-300 dark:border-stone-700
                  text-stone-700 dark:text-stone-300
                  hover:bg-stone-100 dark:hover:bg-stone-800"
                onClick={() => scrollToSection('tarifs')}
              >
                Voir les tarifs
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-8 text-sm text-stone-400
                dark:text-stone-500 flex items-center gap-2
                justify-center lg:justify-start flex-wrap"
            >
              <span>Sans engagement</span>
              <span className="text-stone-300
                dark:text-stone-600"
              >
                &middot;
              </span>
              <span>Sans carte bancaire</span>
              <span className="text-stone-300
                dark:text-stone-600"
              >
                &middot;
              </span>
              <span>Données hébergées en France</span>
            </motion.p>
          </div>

          <div className="relative">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
