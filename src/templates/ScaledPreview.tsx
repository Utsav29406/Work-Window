import { useLayoutEffect, useRef, useState } from 'react'
import type { Portfolio } from '@/lib/types'
import { PortfolioView } from './PortfolioView'
import { PortfolioStyles } from './PortfolioStyles'

interface Props {
  doc: Portfolio
  /** Virtual viewport width the portfolio is laid out at. */
  width?: number
  /** Height of the visible window as a ratio of its width. */
  ratio?: number
  className?: string
}

/** A non-interactive, scaled-down render of a portfolio, used for showcases. */
export function ScaledPreview({ doc, width = 1280, ratio = 0.68, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [width])

  return (
    <div ref={ref} className={className} style={{ position: 'relative', overflow: 'hidden', aspectRatio: `1 / ${ratio}` }} aria-hidden="true">
      <PortfolioStyles />
      <div
        className="pf-wrap"
        style={{ width, height: width * ratio, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
        inert
      >
        <PortfolioView doc={doc} />
      </div>
    </div>
  )
}
