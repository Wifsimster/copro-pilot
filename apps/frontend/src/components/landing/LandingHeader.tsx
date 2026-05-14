import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Building2, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Tarifs', href: '#tarifs' },
  { label: 'FAQ', href: '#faq' },
]

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(href: string) {
    setMobileOpen(false)
    const id = href.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all
        duration-500 ${
          scrolled
            ? 'bg-[#FAF8F5]/90 dark:bg-stone-950/90 backdrop-blur-md'
              + ' shadow-[0_1px_0_rgb(0,0,0,0.06)]'
              + ' dark:shadow-[0_1px_0_rgb(255,255,255,0.05)]'
            : 'bg-transparent'
        }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2.5 group"
          >
            <div className="flex size-9 items-center justify-center
              rounded-lg bg-emerald-700 dark:bg-emerald-600
              transition-transform group-hover:scale-105"
            >
              <Building2 className="size-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold
              text-stone-900 dark:text-stone-50 tracking-tight"
            >
              CoproPilot
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium text-stone-500
                  hover:text-stone-900 dark:text-stone-400
                  dark:hover:text-stone-100 transition-colors
                  relative after:absolute after:bottom-0
                  after:left-0 after:h-px after:w-0
                  after:bg-emerald-600 after:transition-all
                  hover:after:w-full"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-stone-600 dark:text-stone-400
                hover:text-stone-900 dark:hover:text-stone-100"
            >
              <a href="/login">Se connecter</a>
            </Button>
            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800
                dark:bg-emerald-600 dark:hover:bg-emerald-700
                text-white rounded-lg"
              asChild
            >
              <a href="/login">Essai gratuit</a>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-stone-600
              dark:text-stone-400"
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-stone-200
            dark:border-stone-800 bg-[#FAF8F5]
            dark:bg-stone-950 pb-4"
          >
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left px-4 py-3
                  text-sm text-stone-600 dark:text-stone-400
                  hover:bg-stone-100 dark:hover:bg-stone-900"
              >
                {link.label}
              </button>
            ))}
            <div className="px-4 pt-3 flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/login">Se connecter</a>
              </Button>
              <Button
                size="sm"
                className="bg-emerald-700
                  hover:bg-emerald-800 text-white"
                asChild
              >
                <a href="/login">Essai gratuit</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
