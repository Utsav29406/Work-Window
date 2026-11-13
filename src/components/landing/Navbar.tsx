import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button, ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth'

const LINKS = [
  { href: '#templates', label: 'Templates' },
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const user = useAuth((s) => s.user)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] backdrop-blur-md transition-colors',
        scrolled ? 'border-black/5 bg-cream/85' : 'border-transparent bg-cream/0',
      )}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-ink/75 transition hover:text-brand-600">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <ButtonLink to="/builder" variant="ghost" size="md">
                Open builder
              </ButtonLink>
              <ButtonLink to="/dashboard" size="md">
                My portfolios
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="md">
                Sign in
              </ButtonLink>
              <ButtonLink to="/builder" size="md">
                Start free
              </ButtonLink>
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-cream md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-[15px] font-medium hover:bg-sand">
                  {l.label}
                </a>
              ))}
              <ButtonLink to={user ? '/dashboard' : '/login'} variant="secondary" size="lg" className="mt-2">
                {user ? 'My portfolios' : 'Sign in'}
              </ButtonLink>
              <ButtonLink to="/builder" size="lg">
                {user ? 'Open builder' : 'Start free'}
              </ButtonLink>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
