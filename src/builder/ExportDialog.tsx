import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy, Download, ExternalLink, X } from 'lucide-react'
import { useBuilder } from '@/lib/store'
import { buildPortfolioHtml, downloadFile } from '@/lib/exportHtml'
import { Button } from '@/components/ui/Button'

const HOSTS = [
  { name: 'Netlify Drop', how: 'Drag the file onto the page. Live in seconds.', url: 'https://app.netlify.com/drop' },
  { name: 'GitHub Pages', how: 'Add index.html to a repository and enable Pages.', url: 'https://pages.github.com/' },
  { name: 'Vercel', how: 'Create a project from a folder that holds the file.', url: 'https://vercel.com/new' },
]

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const doc = useBuilder((s) => s.doc)
  const html = useMemo(() => (open ? buildPortfolioHtml(doc) : ''), [open, doc])
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null)

  useEffect(() => {
    if (!open) return
    setCopied(null)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const kb = (new Blob([html]).size / 1024).toFixed(1)
  const slug = (doc.profile.name || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied('ok')
    } catch {
      setCopied('fail')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-brand-900/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="export-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="flex max-h-[min(720px,100%)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-cream shadow-lift ring-1 ring-black/5"
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-4">
              <div>
                <h2 id="export-title" className="font-display text-2xl font-semibold">Your site is ready</h2>
                <p className="mt-1 text-sm text-muted">One self-contained file with fonts, styles and images. Upload it anywhere.</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 flex-none place-items-center rounded-full hover:bg-sand">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-5 overflow-auto px-6 pb-6 scrollbar-thin">
              <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-black/5">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-600 font-mono text-[11px] font-semibold text-gold-300">HTML</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{slug}/index.html</div>
                  <div className="font-mono text-xs text-faint">{kb} KB · {doc.projects.length} projects · {doc.design.template} template</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="md" onClick={copy}>
                    {copied === 'ok' ? <Check size={15} /> : <Copy size={15} />}
                    {copied === 'ok' ? 'Copied' : 'Copy code'}
                  </Button>
                  <Button size="md" onClick={() => downloadFile('index.html', html)}>
                    <Download size={15} /> Download
                  </Button>
                </div>
              </div>
              {copied === 'fail' && <p className="-mt-2 text-sm text-red-700">Your browser blocked clipboard access. Use Download instead.</p>}

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">Put it online</h3>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                  {HOSTS.map((h, i) => (
                    <a key={h.name} href={h.url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-1 rounded-2xl bg-white p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-soft">
                      <span className="flex items-center justify-between">
                        <span className="font-mono text-[11px] text-gold-600">0{i + 1}</span>
                        <ExternalLink size={13} className="text-faint transition group-hover:text-brand-600" />
                      </span>
                      <span className="text-sm font-semibold">{h.name}</span>
                      <span className="text-xs leading-snug text-muted">{h.how}</span>
                    </a>
                  ))}
                </div>
              </div>

              <details className="group rounded-2xl bg-white ring-1 ring-black/5">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">View source</summary>
                <pre className="max-h-64 overflow-auto border-t border-line bg-brand-900 p-4 font-mono text-[11px] leading-relaxed text-cream/80 scrollbar-thin">{html.slice(0, 6000)}{html.length > 6000 ? '\n…' : ''}</pre>
              </details>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
