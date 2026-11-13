import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, Lock, RotateCcw, Eraser } from 'lucide-react'
import { useBuilder } from '@/lib/store'
import type { SectionKey } from '@/lib/types'
import { cn } from '@/lib/utils'
import { blankPortfolio, samplePortfolio } from '@/lib/sample'
import { Switch } from '@/components/ui/Controls'
import { TextArea, TextField } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'
import { Block } from './Group'

const KIND: Record<SectionKey, string> = { work: 'Projects', experience: 'Experience', skills: 'Skills', testimonial: 'Testimonial', contact: 'Contact' }

export function LayoutPanel() {
  const sections = useBuilder((s) => s.doc.sections)
  const update = useBuilder((s) => s.update)
  const replace = useBuilder((s) => s.replace)
  const doc = useBuilder((s) => s.doc)

  const move = (i: number, dir: -1 | 1) =>
    update((d) => {
      const j = i + dir
      ;[d.sections[i], d.sections[j]] = [d.sections[j], d.sections[i]]
    })

  return (
    <div className="flex flex-col gap-3">
      <Block title="Sections" note="Turn sections on or off, rename their headings and set the order.">
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-line px-3 py-2.5 text-[13px] text-faint">
          <Lock size={14} /> Intro: name, headline, bio and highlights
        </div>
        <div className="flex flex-col gap-2">
          {sections.map((s, i) => (
            <motion.div layout key={s.k} transition={{ type: 'spring', stiffness: 500, damping: 40 }} className={cn('grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-paper py-2 pl-3 pr-1.5 ring-1 ring-line', !s.on && 'opacity-60')}>
              <Switch checked={s.on} label={`Show ${KIND[s.k]}`} onChange={(v) => update((d) => void (d.sections[i].on = v))} />
              <label className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-faint">{KIND[s.k]}</span>
                <input
                  value={s.title}
                  onChange={(e) => update((d) => void (d.sections[i].title = e.target.value), `sections.${i}.title`)}
                  className={cn('w-full bg-transparent text-[13.5px] font-medium outline-none', !s.on && 'line-through')}
                  aria-label={`${KIND[s.k]} heading`}
                />
              </label>
              <div className="flex">
                <button disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up" className="grid h-7 w-7 place-items-center rounded-lg text-faint hover:bg-sand hover:text-ink disabled:opacity-30"><ArrowUp size={14} /></button>
                <button disabled={i === sections.length - 1} onClick={() => move(i, 1)} aria-label="Move down" className="grid h-7 w-7 place-items-center rounded-lg text-faint hover:bg-sand hover:text-ink disabled:opacity-30"><ArrowDown size={14} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      </Block>

      <Block title="Site details">
        <TextField label="Domain" path="site.domain" placeholder="yourname.com" />
        <TextField label="Page title" path="site.title" hint="Shown in browser tabs and search results." />
        <TextArea label="Search description" path="site.desc" count placeholder="Product designer in Lisbon building calm B2B software…" hint="50 to 160 characters works best in search results." />
      </Block>

      <Block title="Start over" note="Both can be undone.">
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => { replace(samplePortfolio()); toast('Sample content loaded', true) }}>
            <RotateCcw size={14} /> Load sample content
          </Button>
          <Button variant="secondary" size="sm" onClick={() => { replace(blankPortfolio(doc)); toast('Content cleared', true) }}>
            <Eraser size={14} /> Clear all content
          </Button>
        </div>
      </Block>
    </div>
  )
}
