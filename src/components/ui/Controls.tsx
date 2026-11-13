import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-10 flex-none rounded-full transition-colors', checked ? 'bg-brand-600' : 'bg-sand-2')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 34 }}
        className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow', checked ? 'right-1' : 'left-1')}
      />
    </button>
  )
}

interface SegOption<T extends string> {
  value: T
  label: ReactNode
  title?: string
}

/** Pill-style segmented control with a sliding indicator. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  layoutId,
  size = 'md',
  className,
  ariaLabel,
}: {
  value: T
  options: SegOption<T>[]
  onChange: (v: T) => void
  layoutId: string
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn('inline-flex rounded-full bg-sand p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-colors',
              size === 'sm' ? 'h-7 px-3 text-xs' : 'h-8 px-4 text-[13px]',
              active ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-black/5"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600', className)}>
      <span className="h-px w-6 bg-gold-500" />
      {children}
    </span>
  )
}
