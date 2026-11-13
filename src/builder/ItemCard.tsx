import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  subtitle: string
  thumb: ReactNode
  open: boolean
  onToggle: () => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
  first: boolean
  last: boolean
  children: ReactNode
}

const iconBtn = 'grid h-7 w-7 place-items-center rounded-lg text-faint transition hover:bg-sand hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent'

export function ItemCard({ title, subtitle, thumb, open, onToggle, onMove, onDelete, first, last, children }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={cn('overflow-hidden rounded-xl bg-paper ring-1 transition-shadow', open ? 'ring-brand-500/40 shadow-soft' : 'ring-line')}
    >
      <div className="flex items-center gap-3 py-2 pl-2 pr-1.5">
        {thumb}
        <button onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 flex-col py-0.5 text-left">
          <span className="truncate text-[13.5px] font-semibold">{title}</span>
          <span className="truncate text-xs text-faint">{subtitle || ' '}</span>
        </button>
        <div className="flex flex-none">
          <button className={iconBtn} disabled={first} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp size={14} /></button>
          <button className={iconBtn} disabled={last} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown size={14} /></button>
          <button className={cn(iconBtn, 'hover:bg-red-50 hover:text-red-600')} onClick={onDelete} aria-label="Delete"><Trash2 size={14} /></button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
            <div className="flex flex-col gap-3 border-t border-line bg-cream/60 p-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
