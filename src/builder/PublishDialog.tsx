import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, Copy, Download, ExternalLink, Globe, Loader2, LogIn, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { loadPortfolio, publish, slugify, slugProblem, slugStatus, unpublish, SlugTakenError, TooLargeError, type PortfolioRecord } from '@/lib/cloud'
import { SITE_ORIGIN } from '@/lib/firebase'
import { useBuilder } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

type Status = 'checking' | 'free' | 'mine' | 'other' | 'taken'

const STATUS_TEXT: Record<Status, string> = {
  checking: 'Checking…',
  free: 'Available',
  mine: 'This is your current address',
  other: 'You already use this address for another portfolio',
  taken: 'Someone else has this address',
}

interface Props {
  open: boolean
  onClose: () => void
  onDownload: () => void
}

export function PublishDialog({ open, onClose, onDownload }: Props) {
  const navigate = useNavigate()
  const user = useAuth((s) => s.user)
  const cloudId = useBuilder((s) => s.cloudId)
  const doc = useBuilder((s) => s.doc)
  const [rec, setRec] = useState<PortfolioRecord | null>(null)
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<Status>('checking')
  const [busy, setBusy] = useState<'publish' | 'unpublish' | null>(null)
  const [copied, setCopied] = useState(false)

  // Load the portfolio's current address when the dialog opens.
  useEffect(() => {
    if (!open || !cloudId) return
    let alive = true
    setRec(null)
    setCopied(false)
    loadPortfolio(cloudId).then((r) => {
      if (!alive || !r) return
      setRec(r)
      setSlug(r.slug ?? slugify(useBuilder.getState().doc.profile.name || 'portfolio'))
    })
    return () => {
      alive = false
    }
  }, [open, cloudId])

  const problem = slug ? slugProblem(slug) : 'Choose an address.'

  // Debounced availability check.
  useEffect(() => {
    if (!open || !user || !cloudId || problem) return
    setStatus('checking')
    let alive = true
    const t = setTimeout(() => slugStatus(slug, cloudId).then((s) => alive && setStatus(s)), 350)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [open, slug, user, cloudId, problem])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const url = `${SITE_ORIGIN}/${rec?.slug ?? slug}`
  const isLive = !!rec?.live && !!rec.slug
  const canPublish = !!user && !!rec && !problem && (status === 'free' || status === 'mine') && busy === null

  const doPublish = async () => {
    if (!user || !rec) return
    setBusy('publish')
    try {
      setRec(await publish(rec.id, doc, slug))
      setStatus('mine')
      toast(isLive ? 'Live site updated' : 'Your portfolio is live')
    } catch (e) {
      if (e instanceof SlugTakenError) setStatus('taken')
      toast(e instanceof TooLargeError || e instanceof SlugTakenError ? e.message : 'Publishing failed. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const doUnpublish = async () => {
    if (!rec?.slug) return
    setBusy('unpublish')
    try {
      await unpublish(rec.id)
      setRec({ ...rec, live: false })
      toast('Your portfolio is offline')
    } catch {
      toast('Could not take the site offline. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      toast('Copy blocked by the browser. Select the link instead.')
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
            aria-labelledby="publish-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-cream shadow-lift ring-1 ring-black/5"
          >
            <div className="flex items-start justify-between gap-4 p-6 pb-2">
              <div>
                <h2 id="publish-title" className="font-display text-2xl font-semibold">
                  {isLive ? 'Your portfolio is live' : 'Publish your portfolio'}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {isLive ? 'Edits stay private until you press Update live site.' : 'Get a link you can share anywhere, with a contact form and a view counter.'}
                </p>
              </div>
              <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 flex-none place-items-center rounded-full hover:bg-sand">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4 p-6 pt-4">
              {!user ? (
                <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
                  <p className="text-sm leading-relaxed text-ink-2">
                    Sign in to publish. Your portfolio moves into your account as it is, so nothing you made here is lost.
                  </p>
                  <Button size="lg" className="mt-4 w-full" onClick={() => navigate('/login?next=' + encodeURIComponent('/builder?publish=1'))}>
                    <LogIn size={16} /> Sign in or create an account
                  </Button>
                </div>
              ) : !rec ? (
                <div className="flex items-center gap-3 rounded-2xl bg-white p-5 text-sm text-muted ring-1 ring-black/5">
                  <Loader2 size={18} className="animate-spin" /> Saving to your account…
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="pub-slug" className="text-xs font-medium text-ink-2">
                      Your address
                    </label>
                    <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-line bg-paper focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
                      <span className="flex-none pl-3 font-mono text-[13px] text-faint">workwindow.web.app/</span>
                      <input
                        id="pub-slug"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32))}
                        className="min-w-0 flex-1 bg-transparent py-2.5 pr-3 font-mono text-[13.5px] text-ink outline-none"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </div>
                    <p className={`mt-1.5 flex items-center gap-1.5 text-xs ${problem || status === 'taken' || status === 'other' ? 'text-red-700' : status === 'checking' ? 'text-faint' : 'text-brand-600'}`}>
                      {!problem && (status === 'free' || status === 'mine') && <Check size={13} />}
                      {problem ?? STATUS_TEXT[status]}
                    </p>
                  </div>

                  {isLive && (
                    <div className="flex items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5">
                      <Globe size={16} className="ml-1 flex-none text-brand-600" />
                      <a href={url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink hover:underline">
                        {url.replace('https://', '')}
                      </a>
                      <Button variant="secondary" size="sm" onClick={copy}>
                        {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label="Open live site" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink">
                        <ExternalLink size={15} />
                      </a>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="lg" className="flex-1" onClick={doPublish} disabled={!canPublish}>
                      {busy === 'publish' ? <Loader2 size={17} className="animate-spin" /> : <Globe size={16} />}
                      {isLive ? (slug !== rec.slug ? 'Move and update' : 'Update live site') : 'Publish'}
                    </Button>
                    {isLive && (
                      <Button variant="ghost" size="lg" onClick={doUnpublish} disabled={busy !== null}>
                        {busy === 'unpublish' ? <Loader2 size={17} className="animate-spin" /> : null}
                        Take offline
                      </Button>
                    )}
                  </div>
                </>
              )}

              <button onClick={onDownload} className="inline-flex items-center gap-1.5 self-center text-[13px] font-medium text-muted hover:text-ink">
                <Download size={14} /> Or download the site as one HTML file
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
