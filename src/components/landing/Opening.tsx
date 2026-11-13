import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LogoMark } from '@/components/ui/Logo'

const KEY = 'foliocraft:opened'

/** Brief brand reveal, shown once per browser session. */
export function Opening() {
  const [show, setShow] = useState(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
      return !sessionStorage.getItem(KEY)
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!show) return
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {
      /* storage unavailable */
    }
    const t = setTimeout(() => setShow(false), 1500)
    return () => clearTimeout(t)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center bg-brand-900"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div initial={{ scale: 0.4, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <LogoMark className="h-16 w-16 drop-shadow-[0_10px_30px_rgba(214,191,138,.35)]" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 12, letterSpacing: '0.3em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '-0.01em' }}
              transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl font-bold text-cream"
            >
              Work<span className="italic text-gold-400">window</span>
            </motion.p>
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.45, duration: 0.8 }} className="h-px w-32 origin-left bg-gold-500/70" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
