import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollToSection(id: string) {
    setIsMobileOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a
            href="/#/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
          >
            CoproPilot
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('fonctionnalites')}
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Fonctionnalites
            </button>
            <button
              onClick={() => scrollToSection('comment-ca-marche')}
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Comment ca marche
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              FAQ
            </button>
            <a
              href="/#/login"
              className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              Connexion
            </a>
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <a href="/#/login">Essayer gratuitement</a>
            </Button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-600 dark:text-slate-400"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            aria-label="Menu"
          >
            {isMobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
          >
            <nav className="flex flex-col gap-2 px-4 py-4">
              <button
                onClick={() => scrollToSection('fonctionnalites')}
                className="text-left text-sm py-2 text-slate-600 dark:text-slate-400"
              >
                Fonctionnalites
              </button>
              <button
                onClick={() => scrollToSection('comment-ca-marche')}
                className="text-left text-sm py-2 text-slate-600 dark:text-slate-400"
              >
                Comment ca marche
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left text-sm py-2 text-slate-600 dark:text-slate-400"
              >
                FAQ
              </button>
              <a
                href="/#/login"
                className="text-sm py-2 text-slate-600 dark:text-slate-400"
              >
                Connexion
              </a>
              <Button
                asChild
                className="bg-green-600 hover:bg-green-700 text-white mt-2"
              >
                <a href="/#/login">Essayer gratuitement</a>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
