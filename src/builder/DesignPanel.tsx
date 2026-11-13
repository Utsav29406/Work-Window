import { Check, Moon, Sparkles, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useBuilder } from '@/lib/store'
import type { Density, FontKey, Mode, TemplateId } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ACCENTS, FONT_PAIRS, TEMPLATES } from '@/templates/registry'
import { Segmented } from '@/components/ui/Controls'
import { inputClass } from '@/components/ui/Field'
import { Block } from './Group'

export function DesignPanel() {
  const d = useBuilder((s) => s.doc.design)
  const update = useBuilder((s) => s.update)
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K], key?: string) => update((doc) => void (doc.design[k] = v), key)

  const pickTemplate = (id: TemplateId) => {
    const t = TEMPLATES.find((x) => x.id === id)!
    const prev = TEMPLATES.find((x) => x.id === d.template)
    update((doc) => {
      if ((prev?.defaultMode ?? 'light') === doc.design.mode) doc.design.mode = t.defaultMode ?? 'light'
      doc.design.template = id
      // Carry the template's signature accent only if the user hasn't chosen their own.
      if (TEMPLATES.some((x) => x.accent.toLowerCase() === doc.design.accent.toLowerCase())) doc.design.accent = t.accent
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Block title="Template" note="Switching keeps all your content.">
        <div className="grid grid-cols-2 gap-2.5">
          {TEMPLATES.map((t) => {
            const active = d.template === t.id
            return (
              <button
                key={t.id}
                onClick={() => pickTemplate(t.id)}
                aria-pressed={active}
                className={cn('relative flex flex-col gap-1 rounded-2xl p-2 text-left ring-1 transition', active ? 'ring-2 ring-brand-500' : 'ring-line hover:ring-ink/20')}
              >
                <span className="relative block aspect-[16/10] overflow-hidden rounded-xl ring-1 ring-black/5" style={{ background: t.thumb.bg, color: t.thumb.fg }}>
                  <span className="absolute left-2.5 top-2 text-[26px] leading-none" style={{ fontFamily: t.displayFont, fontStyle: t.displayItalic ? 'italic' : undefined, fontWeight: t.displayWeight }}>
                    A<span style={{ color: active ? d.accent : t.accent }}>a</span>
                  </span>
                  <span className="absolute bottom-2 left-2.5 right-2.5 grid grid-cols-2 gap-1.5">
                    <i className="block h-5 rounded-[3px]" style={{ background: t.thumb.card }} />
                    <i className="block h-5 rounded-[3px]" style={{ background: t.thumb.card }} />
                  </span>
                  {t.animated && (
                    <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                      <Sparkles size={9} /> Motion
                    </span>
                  )}
                </span>
                <span className="mt-1 px-1 text-[13px] font-semibold">{t.name}</span>
                <span className="px-1 pb-1 text-[11.5px] leading-snug text-faint">{t.tagline}</span>
                {active && (
                  <motion.span layoutId="tpl-check" className="absolute right-3.5 top-3.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white shadow">
                    <Check size={12} strokeWidth={3} />
                  </motion.span>
                )}
              </button>
            )
          })}
        </div>
      </Block>

      <Block title="Accent color">
        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((c) => {
            const active = c.toLowerCase() === d.accent.toLowerCase()
            return (
              <button
                key={c}
                onClick={() => set('accent', c)}
                aria-label={`Accent ${c}`}
                aria-pressed={active}
                className={cn('grid h-8 w-8 place-items-center rounded-full ring-offset-2 ring-offset-white transition', active ? 'ring-2 ring-ink' : 'ring-1 ring-black/10 hover:scale-110')}
                style={{ background: c }}
              >
                {active && <Check size={14} strokeWidth={3} color={c === '#C9A961' ? '#111' : '#fff'} />}
              </button>
            )
          })}
          <label className="relative grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-full ring-1 ring-black/10 [background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" title="Custom color">
            <input type="color" value={d.accent} onChange={(e) => set('accent', e.target.value, 'design.accent')} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Custom accent color" />
          </label>
          <span className="ml-1 font-mono text-xs text-muted">{d.accent.toUpperCase()}</span>
        </div>
      </Block>

      <Block title="Typography">
        <select className={inputClass} value={d.fonts} onChange={(e) => set('fonts', e.target.value as FontKey)} aria-label="Font pairing">
          {(Object.keys(FONT_PAIRS) as FontKey[]).map((k) => (
            <option key={k} value={k}>{FONT_PAIRS[k].label}</option>
          ))}
        </select>
      </Block>

      <Block title="Shape and rhythm">
        <label className="flex flex-col gap-2">
          <span className="flex justify-between text-xs font-medium text-ink-2">
            Corner radius <span className="font-mono text-faint tabular-nums">{d.radius} px</span>
          </span>
          <input type="range" min={0} max={28} value={d.radius} onChange={(e) => set('radius', +e.target.value, 'design.radius')} className="accent-brand-600" />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-2">Spacing</span>
          <Segmented<Density>
            size="sm"
            layoutId="density"
            value={d.density}
            onChange={(v) => set('density', v)}
            options={[{ value: 'compact', label: 'Compact' }, { value: 'regular', label: 'Regular' }, { value: 'airy', label: 'Airy' }]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-ink-2">Appearance</span>
          <Segmented<Mode>
            size="sm"
            layoutId="mode-panel"
            value={d.mode}
            onChange={(v) => set('mode', v)}
            options={[{ value: 'light', label: <><Sun size={13} /> Light</> }, { value: 'dark', label: <><Moon size={13} /> Dark</> }]}
          />
        </div>
      </Block>
    </div>
  )
}
