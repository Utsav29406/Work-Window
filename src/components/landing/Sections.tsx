import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Minus, Plus } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/utils'
import { Reveal, SectionTitle } from './Reveal'

const STEPS = [
  { n: '1', title: 'Pick a template', body: 'Start from one of eleven designs, six of them animated. You can switch at any time without losing a word.' },
  { n: '2', title: 'Add your work', body: 'Projects, outcomes, experience and skills. The strength score shows what to add next.' },
  { n: '3', title: 'Publish', body: 'Export one HTML file and put it on any host, or keep refining. Your draft saves itself.' },
]

export function Steps() {
  return (
    <section id="how" className="scroll-mt-20 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle center eyebrow="How it works" title={<>Simple as <span className="italic text-brand-600">1, 2, 3</span></>} />
        <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
          <div aria-hidden className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-[repeating-linear-gradient(90deg,var(--color-gold-400)_0_6px,transparent_6px_12px)] md:block" />
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="relative flex flex-col items-center text-center">
              <span className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-600 font-display text-2xl font-semibold italic text-gold-300 shadow-lift ring-8 ring-cream">
                {s.n}
              </span>
              <h3 className="mt-6 font-display text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 max-w-[32ch] text-[15px] leading-relaxed text-muted">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const PLANS = [
  {
    name: 'Starter',
    price: '₹0',
    per: 'forever',
    blurb: 'Everything you need for a first portfolio.',
    features: ['All eleven templates', 'Publish to workwindow.web.app/you', 'Contact form with inbox', 'Page view counter', 'Unlimited portfolios', 'HTML export'],
    cta: 'Start free',
  },
  {
    name: 'Pro',
    price: '₹299',
    per: 'per month',
    blurb: 'For people actively job hunting or pitching clients.',
    features: ['Everything in Starter', 'Custom domain', 'Detailed visitor analytics', 'Password-protected case studies', 'Remove WorkWindow credit'],
    cta: 'Coming soon',
    soon: true,
    featured: true,
  },
  {
    name: 'Studio',
    price: '₹999',
    per: 'per month',
    blurb: 'For agencies and teams with several people to show.',
    features: ['Everything in Pro', 'Team workspace', 'Shared brand kit', 'Priority support'],
    cta: 'Coming soon',
    soon: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 bg-paper/70 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle center eyebrow="Pricing" title={<>Start free. <span className="italic text-brand-600">Upgrade</span> when it pays off.</>} sub="Everything in Starter is live today. Pro and Studio are coming soon." />
        <div className="mt-16 grid items-stretch gap-5 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-3xl p-8 ring-1',
                  p.featured ? 'bg-brand-700 text-cream ring-brand-600 shadow-lift lg:-my-4 lg:py-12' : 'bg-white ring-black/5 shadow-soft',
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-8 rounded-full bg-gold-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-900">Coming soon</span>
                )}
                <h3 className={cn('font-display text-2xl font-semibold', p.featured && 'text-gold-300')}>{p.name}</h3>
                <p className={cn('mt-1 text-sm', p.featured ? 'text-cream/70' : 'text-muted')}>{p.blurb}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display text-5xl font-semibold tracking-tight">{p.price}</span>
                  <span className={cn('text-sm', p.featured ? 'text-cream/60' : 'text-muted')}>{p.per}</span>
                </div>
                <ul className="mt-7 flex flex-1 flex-col gap-3 text-[15px]">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className={cn('mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full', p.featured ? 'bg-gold-400/20 text-gold-300' : 'bg-brand-50 text-brand-600')}>
                        <Check size={12} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                {'soon' in p && p.soon ? (
                  <span
                    aria-disabled="true"
                    className={cn(
                      'mt-9 inline-flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold',
                      p.featured ? 'bg-white/10 text-cream/80 ring-1 ring-white/20' : 'bg-sand text-muted',
                    )}
                  >
                    {p.cta}
                  </span>
                ) : (
                  <ButtonLink to="/builder" size="lg" variant={p.featured ? 'gold' : 'secondary'} className="mt-9 w-full">
                    {p.cta}
                  </ButtonLink>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQS = [
  { q: 'Do I need to know how to code?', a: 'No. You fill in fields and pick design options. The builder writes the HTML and CSS for you.' },
  { q: 'Where is my work saved?', a: 'Without an account, your draft is saved in this browser. Sign in with your email and it moves into your account, so you can pick it up on any device.' },
  { q: 'Can I switch templates later?', a: 'Yes. Content and design are separate, so switching templates keeps every project, role and sentence you wrote.' },
  { q: 'How do I publish the site?', a: 'Press Publish, choose an address like workwindow.web.app/yourname and your portfolio is live. You can also download it as a single HTML file and host it anywhere.' },
  { q: 'How do visitors contact me?', a: 'Published pages include a contact form. Messages land in your inbox on the My portfolios page, next to a count of page views.' },
  { q: 'Can I use my own images?', a: 'Yes. Upload a cover for each project. Images are resized in your browser and stored with your account when you are signed in.' },
]

export function FAQ() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="scroll-mt-20 py-24 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionTitle eyebrow="Questions" title={<>Good to <span className="italic text-brand-600">know</span></>} sub="Anything else? The builder is free to try, with no account needed." />
        <Reveal className="divide-y divide-line border-y border-line">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q}>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="font-display text-xl font-semibold">{f.q}</span>
                  <span className={cn('grid h-8 w-8 flex-none place-items-center rounded-full transition', isOpen ? 'bg-brand-600 text-cream' : 'bg-sand text-ink')}>
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                      <p className="max-w-[62ch] pb-6 text-[15px] leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

export function CTA() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-brand-700 px-6 py-16 text-center sm:px-12 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-10 h-80 w-80 rounded-full bg-brand-500/50 blur-3xl" />
          <div className="absolute inset-0 opacity-[.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:44px_44px]" />
        </div>
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-[clamp(34px,5vw,64px)] font-semibold leading-[1.02] tracking-tight text-cream">
            Your next role starts with <span className="italic text-gold-300">a great first look.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-cream/70">Open the builder with sample content, make it yours, and export when you are ready.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink to="/builder" variant="gold" size="lg" className="group">
              Build my portfolio <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </ButtonLink>
            <ButtonLink to="/builder?template=luxe" variant="light" size="lg">
              Start with Luxe
            </ButtonLink>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

export function Footer() {
  const cols = [
    { h: 'Product', l: [['Templates', '#templates'], ['Features', '#features'], ['Pricing', '#pricing'], ['Builder', '/builder']] },
    { h: 'Templates', l: [['Editorial', '/builder?template=editorial'], ['Luxe', '/builder?template=luxe'], ['Grid', '/builder?template=swiss'], ['Terminal', '/builder?template=mono'], ['Studio', '/builder?template=studio'], ['Aurora', '/builder?template=aurora'], ['Bento', '/builder?template=bento'], ['Brutal', '/builder?template=brutal'], ['Neon', '/builder?template=neon'], ['Kinetic', '/builder?template=kinetic'], ['Holo', '/builder?template=holo']] },
    { h: 'Help', l: [['How it works', '#how'], ['FAQ', '#faq']] },
  ]
  return (
    <footer className="border-t border-line bg-paper/60 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">A portfolio builder for people whose work deserves better than a template.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">{c.h}</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-sm">
              {c.l.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-ink-2 transition hover:text-brand-600">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-wrap justify-between gap-4 border-t border-line px-4 pt-6 text-xs text-faint sm:px-6">
        <span>© {new Date().getFullYear()} WorkWindow</span>
        <span>Made for people who make things.</span>
      </div>
    </footer>
  )
}
