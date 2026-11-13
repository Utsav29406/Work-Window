import { useRef, type MouseEvent } from 'react'
import { motion } from 'motion/react'
import { Lock, RotateCw } from 'lucide-react'
import { useBuilder } from '@/lib/store'
import { cn } from '@/lib/utils'
import { PortfolioView } from '@/templates/PortfolioView'
import { PortfolioStyles } from '@/templates/PortfolioStyles'

const WIDTH = { desktop: 1240, tablet: 820, phone: 390 } as const

export function Canvas() {
  const doc = useBuilder((s) => s.doc)
  const device = useBuilder((s) => s.device)
  const scroller = useRef<HTMLDivElement>(null)

  // Keep in-page anchor links inside the preview window.
  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('#')) {
      e.preventDefault()
      const el = href === '#pf-top' ? null : scroller.current?.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const phone = device === 'phone'

  return (
    <div className="dotted flex min-h-0 flex-1 justify-center overflow-hidden bg-sand/50 p-3 sm:p-6">
      <PortfolioStyles />
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 260, damping: 32 }}
        style={{ maxWidth: WIDTH[device] + (phone ? 16 : 0) }}
        className={cn(
          'flex h-full w-full min-w-0 flex-col overflow-hidden bg-white shadow-lift',
          phone ? 'rounded-[40px] border-[8px] border-brand-900' : device === 'tablet' ? 'rounded-[24px] ring-1 ring-black/10' : 'rounded-2xl ring-1 ring-black/10',
        )}
      >
        {phone ? (
          <div className="relative flex h-8 flex-none items-center justify-between bg-white px-6 text-[11px] font-semibold text-ink">
            <span>9:41</span>
            <span className="absolute left-1/2 top-1.5 h-5 w-20 -translate-x-1/2 rounded-full bg-brand-900" />
            <span className="font-mono text-[10px] text-faint">{doc.site.domain}</span>
          </div>
        ) : (
          <div className="flex flex-none items-center gap-3 border-b border-line bg-paper px-4 py-2">
            <span className="flex gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full bg-[#ec6a5e]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]" />
              <i className="h-2.5 w-2.5 rounded-full bg-[#61c554]" />
            </span>
            <span className="mx-auto flex h-7 min-w-0 max-w-md flex-1 items-center justify-center gap-1.5 rounded-lg bg-sand/70 px-3 font-mono text-[11.5px] text-muted">
              <Lock size={11} className="flex-none" />
              <span className="truncate">{doc.site.domain || 'yourname.com'}</span>
            </span>
            <button onClick={() => scroller.current?.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll preview to top" className="grid h-7 w-7 place-items-center rounded-lg text-faint hover:bg-sand hover:text-ink">
              <RotateCw size={13} />
            </button>
          </div>
        )}
        <div ref={scroller} onClick={onClick} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin">
          <div className="pf-wrap min-h-full">
            <PortfolioView doc={doc} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export { WIDTH }
