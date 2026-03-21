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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a
            href="/#/"
            className="flex items-center gap-2 text-slate-900 dark:text-white"
          >
            <Building2 className="size-7 text-primary" />
            <span className="text-lg font-bold">CoproPilot</span>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="/#/login">Se connecter</a>
            </Button>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              asChild
            >
              <a href="/#/login">Essai gratuit</a>
            </Button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pb-4">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                {link.label}
              </button>
            ))}
            <div className="px-4 pt-3 flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/#/login">Se connecter</a>
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                asChild
              >
                <a href="/#/login">Essai gratuit</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
