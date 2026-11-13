import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Moon, Sun } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Controls'
import { ScaledPreview } from '@/templates/ScaledPreview'
import { TEMPLATES } from '@/templates/registry'
import type { Mode, TemplateId } from '@/lib/types'
import { cn } from '@/lib/utils'
import { demoDoc } from './demo'
import { Reveal, SectionTitle } from './Reveal'

export function TemplateShowcase() {
  const [id, setId] = useState<TemplateId>('luxe')
  const [mode, setMode] = useState<Mode>('dark')
  const t = TEMPLATES.find((x) => x.id === id)!

  return (
    <section id="templates" className="scroll-mt-20 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Templates"
            title={
              <>
                {TEMPLATES.length} templates, each with a <span className="italic text-brand-600">point of view</span>
              </>
            }
            sub="Every template is a complete design system: type, spacing, color and layout rules that hold up from a phone to a 27-inch display. The ones marked Motion animate on load and as visitors scroll, in your exported site too."
          />
          <Reveal>
            <Segmented
              layoutId="show-mode"
              value={mode}
              onChange={setMode}
              ariaLabel="Preview appearance"
              options={[
                { value: 'light', label: <><Sun size={14} /> Light</> },
                { value: 'dark', label: <><Moon size={14} /> Dark</> },
              ]}
            />
          </Reveal>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[320px_1fr]">
          <Reveal className="flex gap-2 overflow-x-auto pb-2 lg:max-h-[640px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 lg:pl-1">
            {TEMPLATES.map((x) => {
              const active = x.id === id
              return (
                <button
                  key={x.id}
                  onClick={() => setId(x.id)}
                  aria-pressed={active}
                  className={cn(
                    'group relative flex min-w-[220px] items-center gap-4 rounded-2xl p-3 text-left transition lg:min-w-0',
                    active ? 'bg-white shadow-soft ring-1 ring-black/5' : 'hover:bg-sand/60',
                  )}
                >
                  <span className="grid h-14 w-14 flex-none place-items-center rounded-xl text-2xl ring-1 ring-black/5" style={{ background: x.thumb.bg, color: x.thumb.fg, fontFamily: x.displayFont, fontStyle: x.displayItalic ? 'italic' : undefined, fontWeight: x.displayWeight }}>
                    A<span style={{ color: x.accent }}>a</span>
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-semibold">
                      {x.name}
                      {x.animated && <span className="rounded-full bg-gold-300/50 px-2 py-px text-[10px] font-semibold uppercase tracking-wide text-ink-2">Motion</span>}
                    </span>
                    <span className="block text-[13px] leading-snug text-muted">{x.tagline}</span>
                  </span>
                  {active && <motion.span layoutId="tpl-bar" className="absolute inset-y-3 -left-px hidden w-[3px] rounded-full bg-gold-500 lg:block" />}
                </button>
              )
            })}
          </Reveal>

          <Reveal delay={0.1} className="min-w-0">
            <div className="overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-black/5">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={id + mode} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                  <ScaledPreview doc={demoDoc(id, mode)} width={1280} ratio={0.62} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl">
                <p className="text-[15px] leading-relaxed text-ink-2">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {t.bestFor.map((b) => (
                    <span key={b} className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink-2">{b}</span>
                  ))}
                </div>
              </div>
              <ButtonLink to={`/builder?template=${id}`} size="lg" className="group">
                Use {t.name}
                <ArrowUpRight size={17} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
