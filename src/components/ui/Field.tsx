import { useId, type ReactNode } from 'react'
import { useBuilder } from '@/lib/store'
import { cn, getPath, setPath } from '@/lib/utils'

const control =
  'w-full rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] text-ink placeholder:text-faint transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10'

interface FieldShellProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  counter?: ReactNode
  children: ReactNode
  className?: string
}

export function FieldShell({ label, htmlFor, hint, counter, children, className }: FieldShellProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-baseline justify-between gap-2 text-xs font-medium text-ink-2">
        {label}
        {counter != null && <span className="font-mono text-[11px] font-normal text-faint tabular-nums">{counter}</span>}
      </label>
      {children}
      {hint && <p className="text-xs leading-snug text-faint">{hint}</p>}
    </div>
  )
}

interface BoundProps {
  label: string
  /** Dot path into the portfolio document, e.g. "profile.name". */
  path: string
  hint?: ReactNode
  placeholder?: string
  className?: string
}

/** Single-line text input bound to a path in the portfolio. */
export function TextField({ label, path, hint, placeholder, className, csv }: BoundProps & { csv?: boolean }) {
  const id = useId()
  const raw = useBuilder((s) => getPath(s.doc, path))
  const update = useBuilder((s) => s.update)
  const value = csv ? ((raw as string[]) ?? []).join(', ') : ((raw as string) ?? '')
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} className={className}>
      <input
        id={id}
        className={control}
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const v = csv ? e.target.value.split(',').map((x) => x.trim()).filter(Boolean) : e.target.value
          update((d) => setPath(d, path, v), path)
        }}
      />
    </FieldShell>
  )
}

/** Multi-line text bound to a path, with an optional character counter. */
export function TextArea({ label, path, hint, placeholder, className, rows = 3, count }: BoundProps & { rows?: number; count?: boolean }) {
  const id = useId()
  const value = (useBuilder((s) => getPath(s.doc, path)) as string) ?? ''
  const update = useBuilder((s) => s.update)
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} counter={count ? `${value.length} chars` : undefined} className={className}>
      <textarea
        id={id}
        rows={rows}
        className={cn(control, 'resize-y leading-relaxed')}
        value={value}
        placeholder={placeholder}
        onChange={(e) => update((d) => setPath(d, path, e.target.value), path)}
      />
    </FieldShell>
  )
}

export const inputClass = control
