import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Collapsible editor group with a smooth height animation. */
export function Group({ title, count, icon, defaultOpen = false, children }: { title: string; count?: number; icon?: ReactNode; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={cn('rounded-2xl bg-white ring-1 transition-shadow', open ? 'shadow-soft ring-black/[.07]' : 'ring-black/5')}>
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
        {icon && <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>}
        <span className="text-[14px] font-semibold">{title}</span>
        {count != null && <span className="rounded-md bg-sand px-1.5 font-mono text-[11px] text-muted tabular-nums">{count}</span>}
        <ChevronDown size={16} className={cn('ml-auto text-faint transition-transform duration-300', open && 'rotate-180')} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3.5 px-4 pb-4 pt-0.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export function Block({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5">
      <div>
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">{title}</h3>
        {note && <p className="mt-1 text-[13px] leading-snug text-muted">{note}</p>}
      </div>
      {children}
    </section>
  )
}
