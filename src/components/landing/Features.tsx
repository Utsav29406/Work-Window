import { Code2, Gauge, Laptop, Palette, RotateCcw, Save } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal, SectionTitle } from './Reveal'

function Card({ icon, title, body, children, className, dark }: { icon: ReactNode; title: string; body: string; children?: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 ring-1 transition duration-300 hover:-translate-y-1',
        dark ? 'bg-brand-700 text-cream ring-brand-600' : 'bg-white ring-black/5 shadow-soft hover:shadow-lift',
        className,
      )}
    >
      <span className={cn('grid h-11 w-11 place-items-center rounded-2xl', dark ? 'bg-white/10 text-gold-300' : 'bg-brand-50 text-brand-600')}>{icon}</span>
      <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <p className={cn('mt-2 max-w-[42ch] text-[15px] leading-relaxed', dark ? 'text-cream/70' : 'text-muted')}>{body}</p>
      {children && <div className="mt-6 flex flex-1 items-end">{children}</div>}
    </div>
  )
}

function Devices() {
  return (
    <div className="flex w-full items-end justify-center gap-4">
      {[
        { w: 'w-[52%]', h: 'h-32', r: 'rounded-xl' },
        { w: 'w-[24%]', h: 'h-28', r: 'rounded-xl' },
        { w: 'w-[13%]', h: 'h-24', r: 'rounded-2xl' },
      ].map((d, i) => (
        <div key={i} className={cn(d.w, d.h, d.r, 'overflow-hidden bg-cream p-2 ring-1 ring-line transition-transform duration-500 group-hover:-translate-y-1')} style={{ transitionDelay: `${i * 60}ms` }}>
          <div className="h-2 w-1/2 rounded bg-ink/80" />
          <div className="mt-1.5 h-1.5 w-3/4 rounded bg-ink/15" />
          <div className={cn('mt-2.5 grid gap-1.5', i === 0 ? 'grid-cols-2' : 'grid-cols-1')}>
            <div className="aspect-[4/3] rounded bg-gradient-to-br from-[#5b78ff] to-[#2337b8]" />
            {i === 0 && <div className="aspect-[4/3] rounded bg-gradient-to-br from-[#f39a62] to-[#c4482a]" />}
          </div>
        </div>
      ))}
    </div>
  )
}

function Ring() {
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-white/10" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" strokeLinecap="round" className="stroke-gold-400" strokeDasharray={c} strokeDashoffset={c * 0.1} />
      </svg>
      <div>
        <div className="font-display text-4xl font-semibold text-cream">90%</div>
        <div className="text-xs text-cream/60">9 of 10 checks passed</div>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-paper/70 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="Built for craft"
          title={
            <>
              Everything a serious portfolio needs, <span className="italic text-brand-600">nothing it doesn't</span>
            </>
          }
        />
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <Card icon={<Laptop size={20} />} title="See every screen as you type" body="Switch between desktop, tablet and phone while you edit. Layouts respond to the frame, so what you see is what visitors get.">
              <Devices />
            </Card>
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-2">
            <Card dark icon={<Gauge size={20} />} title="Portfolio strength" body="A live checklist that tells you what a hiring manager will notice is missing.">
              <Ring />
            </Card>
          </Reveal>
          <Reveal className="md:col-span-2">
            <Card icon={<Palette size={20} />} title="Your brand, dialed in" body="Accent color, font pairing, corner radius, spacing and light or dark mode.">
              <div className="flex gap-2">
                {['#2F4BFF', '#12493B', '#C9A961', '#E5484D', '#D6409F'].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full ring-2 ring-white transition-transform group-hover:scale-110" style={{ background: c, boxShadow: '0 0 0 1px rgb(0 0 0 / .08)' }} />
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.05} className="md:col-span-2">
            <Card icon={<RotateCcw size={20} />} title="Undo anything" body="Every change is reversible, including deleted projects. Experiment without fear.">
              <div className="flex items-center gap-1.5 font-mono text-sm">
                {['Ctrl', 'Z'].map((k) => (
                  <kbd key={k} className="rounded-lg border border-line border-b-[3px] bg-cream px-2.5 py-1 text-ink-2">{k}</kbd>
                ))}
              </div>
            </Card>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-2">
            <Card icon={<Save size={20} />} title="Saves as you go" body="Your draft is stored in your browser after every keystroke. Close the tab and pick up later." />
          </Reveal>
          <Reveal className="md:col-span-6">
            <Card icon={<Code2 size={20} />} title="Export a site you own" body="Download one clean index.html with fonts, styles and images included. Host it on GitHub Pages, Netlify, Vercel or your own server.">
              <pre className="w-full overflow-x-auto rounded-2xl bg-brand-900 p-5 font-mono text-[12.5px] leading-relaxed text-cream/80">
                <span className="text-gold-400">{'<!doctype html>'}</span>
                {'\n'}
                <span className="text-cream/50">{'<title>'}</span>Mira Okafor, Product Designer<span className="text-cream/50">{'</title>'}</span>
                {'\n'}
                <span className="text-cream/50">{'<div class='}</span>
                <span className="text-[#9fd8be]">"pf t-luxe m-dark"</span>
                <span className="text-cream/50">{'>'}</span> … <span className="text-cream/50">{'</div>'}</span>
                {'\n'}
                <span className="text-cream/40">{'// 1 file · no build step · no lock-in'}</span>
              </pre>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
