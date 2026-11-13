import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Laptop, Smartphone, Sparkles, Tablet } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { ScaledPreview } from '@/templates/ScaledPreview'
import { TEMPLATES } from '@/templates/registry'
import { demoDoc } from './demo'

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const [i, setI] = useState(0)
  const t = TEMPLATES[i]
  const switcher = useRef<HTMLDivElement>(null)

  // Keep the active template pill visible in the scrollable switcher (horizontal only).
  useEffect(() => {
    const box = switcher.current
    const pill = box?.children[i] as HTMLElement | undefined
    if (box && pill) box.scrollTo({ left: pill.offsetLeft - box.clientWidth / 2 + pill.offsetWidth / 2, behavior: 'smooth' })
  }, [i])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((x) => (x + 1) % TEMPLATES.length), 3600)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="relative overflow-hidden">
      {/* soft background wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-gold-300/40 blur-3xl" />
        <div className="absolute top-40 left-[-15%] h-[420px] w-[420px] rounded-full bg-brand-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:pb-28 lg:pt-20">
        <div>
          <motion.a
            href="#templates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-gold-400/50 bg-paper/80 py-1 pl-1 pr-3.5 text-[13px] font-medium text-ink-2 shadow-soft"
          >
            <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold-300">New</span>
            6 animated templates: Aurora, Bento, Neon and more
            <ArrowRight size={14} className="text-gold-600" />
          </motion.a>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease }}
            className="mt-7 font-display text-[clamp(44px,6.4vw,84px)] font-semibold leading-[0.98] tracking-[-0.025em] text-ink"
          >
            Your work,
            <br />
            <span className="italic text-brand-600">beautifully</span> told.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease }}
            className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-muted"
          >
            WorkWindow turns your projects, experience and story into a portfolio that looks designed, not assembled. Edit on the left, watch it
            come alive on every screen size, and publish a clean site in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <ButtonLink to="/builder" size="lg" className="group">
              Build my portfolio
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <a
              href="#templates"
              className="inline-flex h-12 items-center justify-center rounded-full bg-paper px-7 text-[15px] font-semibold text-ink ring-1 ring-line transition hover:bg-white hover:ring-ink/25"
            >
              Browse templates
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2"
          >
            {['No code needed', 'Free plan, no card', 'Export your own HTML'].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-50 text-brand-600">
                  <Check size={12} strokeWidth={3} />
                </span>
                {x}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Live product shot */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotate: 1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[22px] bg-white shadow-lift ring-1 ring-black/5">
            <div className="flex items-center gap-3 border-b border-line bg-paper px-4 py-2.5">
              <span className="flex gap-1.5">
                <i className="h-2.5 w-2.5 rounded-full bg-[#ec6a5e]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]" />
                <i className="h-2.5 w-2.5 rounded-full bg-[#61c554]" />
              </span>
              <span className="mx-auto flex h-6 max-w-[260px] flex-1 items-center justify-center rounded-md bg-sand/70 font-mono text-[11px] text-muted">
                miraokafor.design
              </span>
              <span className="w-12" />
            </div>
            <div className="relative">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <ScaledPreview doc={demoDoc(t.id)} width={1240} ratio={0.66} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* floating: template switcher */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease }}
            ref={switcher}
            className="absolute -bottom-6 left-4 flex max-w-[calc(100%-2rem)] items-center gap-1 overflow-x-auto rounded-full bg-white/90 p-1 shadow-lift ring-1 ring-black/5 backdrop-blur [scrollbar-width:none] sm:-left-6 sm:max-w-[calc(100%-9rem)]"
          >
            {TEMPLATES.map((x, k) => (
              <button
                key={x.id}
                onClick={() => setI(k)}
                className="relative flex-none rounded-full px-3 py-1.5 text-xs font-semibold text-ink-2"
                aria-pressed={k === i}
              >
                {k === i && <motion.span layoutId="hero-tpl" className="absolute inset-0 rounded-full bg-brand-600" transition={{ type: 'spring', stiffness: 500, damping: 36 }} />}
                <span className={`relative ${k === i ? 'text-cream' : ''}`}>{x.name}</span>
              </button>
            ))}
          </motion.div>

          {/* floating: strength */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7, ease }}
            className="absolute -right-3 top-16 hidden w-52 rounded-2xl bg-white/95 p-4 shadow-lift ring-1 ring-black/5 backdrop-blur sm:block lg:-right-8"
          >
            <div className="flex items-center justify-between text-xs font-medium text-muted">
              <span className="flex items-center gap-1.5"><Sparkles size={13} className="text-gold-500" /> Portfolio strength</span>
              <span className="font-mono text-ink">92%</span>
            </div>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand">
              <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} transition={{ delay: 1.3, duration: 1.2, ease }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600" />
            </div>
            <p className="mt-2.5 text-[11.5px] leading-snug text-muted">Add a search description to reach 100%.</p>
          </motion.div>

          {/* floating: devices */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.7, ease }}
            className="absolute -bottom-5 right-6 hidden items-center gap-1 rounded-full bg-brand-900 px-2 py-1.5 text-gold-300 shadow-lift sm:flex"
          >
            {[Laptop, Tablet, Smartphone].map((Icon, k) => (
              <span key={k} className={`grid h-7 w-7 place-items-center rounded-full ${k === 0 ? 'bg-white/12 text-cream' : ''}`}>
                <Icon size={14} />
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
