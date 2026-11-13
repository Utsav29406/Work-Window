import css from './portfolio.css?raw'

export const PORTFOLIO_CSS = css

/** Injects the portfolio stylesheet once per document, however many previews mount. */
let injected = false
export function PortfolioStyles() {
  if (typeof document !== 'undefined' && !injected) {
    const tag = document.createElement('style')
    tag.dataset.portfolio = ''
    tag.textContent = css
    document.head.appendChild(tag)
    injected = true
  }
  return null
}
