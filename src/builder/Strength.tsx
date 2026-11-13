import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronUp, CircleCheck, CircleDashed } from 'lucide-react'
import { useBuilder } from '@/lib/store'
import { strengthChecks } from '@/lib/strength'
import { cn } from '@/lib/utils'

export function Strength({ onGo }: { onGo: (tab: 'content' | 'design' | 'layout') => void }) {
  const doc = useBuilder((s) => s.doc)
  const [open, setOpen] = useState(false)
  const checks = strengthChecks(doc).sort((a, b) => Number(a.ok) - Number(b.ok))
  const passed = checks.filter((c) => c.ok).length
  const pct = Math.round((passed / checks.length) * 100)

  return (
    <div className="border-t border-line bg-paper px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-col gap-2 text-left">
        <span className="flex w-full items-center justify-between text-[13px] font-medium">
          Portfolio strength
          <span className="flex items-center gap-2">
            <span className={cn('font-mono tabular-nums', pct === 100 ? 'text-brand-600' : 'text-ink')}>{pct}%</span>
            <ChevronUp size={15} className={cn('text-faint transition-transform', !open && 'rotate-180')} />
          </span>
        </span>
        <span className="h-1.5 w-full overflow-hidden rounded-full bg-sand">
          <motion.span
            className={cn('block h-full rounded-full', pct < 60 ? 'bg-gold-500' : 'bg-brand-600')}
            animate={{ width: `${pct}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex max-h-52 flex-col gap-1 overflow-auto pt-3 scrollbar-thin">
              {checks.map((c) => (
                <li key={c.label}>
                  <button
                    onClick={() => !c.ok && onGo(c.tab)}
                    className={cn('flex w-full items-center gap-2 rounded-lg px-1.5 py-1 text-left text-[12.5px]', c.ok ? 'text-faint' : 'text-ink-2 hover:bg-sand')}
                  >
                    {c.ok ? <CircleCheck size={14} className="flex-none text-brand-500" /> : <CircleDashed size={14} className="flex-none text-gold-600" />}
                    {c.label}
                  </button>
                </li>
              ))}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
