import type { ReactNode } from 'react'
import { motion } from 'motion/react'

/** Fades content up as it scrolls into view. Content stays readable if motion is off. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0.001, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function SectionTitle({ eyebrow, title, sub, center }: { eyebrow: string; title: ReactNode; sub?: ReactNode; center?: boolean }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <span className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold-600 ${center ? 'justify-center' : ''}`}>
        <span className="h-px w-6 bg-gold-500" />
        {eyebrow}
        {center && <span className="h-px w-6 bg-gold-500" />}
      </span>
      <h2 className="mt-4 font-display text-[clamp(32px,4.4vw,54px)] font-semibold leading-[1.05] tracking-[-0.02em]">{title}</h2>
      {sub && <p className="mt-5 text-[17px] leading-relaxed text-muted">{sub}</p>}
    </Reveal>
  )
}
