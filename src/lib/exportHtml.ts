import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Portfolio } from './types'
import { PortfolioView } from '@/templates/PortfolioView'
import { PORTFOLIO_CSS } from '@/templates/PortfolioStyles'
import { FONTS_URL } from '@/templates/registry'

const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Builds a complete, self-contained index.html for the portfolio. */
export function buildPortfolioHtml(doc: Portfolio) {
  const body = renderToStaticMarkup(createElement(PortfolioView, { doc, exportMode: true }))
  const title = doc.site.title || doc.profile.name
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escAttr(title)}</title>
<meta name="description" content="${escAttr(doc.site.desc)}">
<meta property="og:title" content="${escAttr(title)}">
<meta property="og:description" content="${escAttr(doc.site.desc)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS_URL}">
<style>
html,body{margin:0;min-height:100%;scroll-behavior:smooth}
body{display:flex;flex-direction:column;min-height:100vh}
.pf-wrap{flex:1}
${PORTFOLIO_CSS}
</style>
</head>
<body>
<div class="pf-wrap">${body}</div>
</body>
</html>
`
}

export function downloadFile(name: string, content: string, type = 'text/html') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
