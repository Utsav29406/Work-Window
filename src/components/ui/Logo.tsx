import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-9 w-9', className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <rect x="8" y="8" width="16" height="16" rx="3" fill="none" stroke="#faf8f3" strokeWidth="2.2" />
      <path d="M16 8v16M8 16h16" stroke="#faf8f3" strokeWidth="2.2" />
      <rect x="17.6" y="9.6" width="4.8" height="4.8" rx="1" className="fill-gold-400" />
    </svg>
  )
}

export function Logo({ to = '/', compact = false, light = false }: { to?: string; compact?: boolean; light?: boolean }) {
  return (
    <Link to={to} className="group flex items-center gap-2.5" aria-label="WorkWindow home">
      <LogoMark className={cn('transition-transform duration-300 group-hover:-rotate-6', compact && 'h-8 w-8')} />
      <span className={cn('font-display font-bold tracking-tight', compact ? 'text-xl' : 'text-2xl', light ? 'text-cream' : 'text-ink')}>
        Work<span className="italic text-gold-500">window</span>
      </span>
    </Link>
  )
}
