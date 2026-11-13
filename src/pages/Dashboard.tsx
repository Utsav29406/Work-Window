import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CloudUpload, Eye, Globe, Inbox, Loader2, LogOut, Mail, Pencil, Plus, Trash2, X } from 'lucide-react'
import { signOut, useAuth } from '@/lib/auth'
import {
  createPortfolio,
  deleteMessage,
  deletePortfolio,
  liftImages,
  listMessages,
  listPortfolios,
  TooLargeError,
  type Message,
  type PortfolioRecord,
} from '@/lib/cloud'
import { SITE_ORIGIN } from '@/lib/firebase'
import { samplePortfolio } from '@/lib/sample'
import { useBuilder } from '@/lib/store'
import { templateById } from '@/templates/registry'
import { ScaledPreview } from '@/templates/ScaledPreview'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { toast } from '@/components/ui/Toast'

const when = (r: PortfolioRecord) => {
  const t = r.updatedAt ? new Date(r.updatedAt) : null
  if (!t) return 'Just now'
  const mins = Math.round((Date.now() - t.getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`
  return t.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

function Messages({ portfolio, onClose }: { portfolio: PortfolioRecord; onClose: () => void }) {
  const { id: portfolioId, slug } = portfolio
  const [items, setItems] = useState<Message[] | null>(null)

  useEffect(() => {
    listMessages(portfolioId)
      .then(setItems)
      .catch(() => setItems([]))
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [portfolioId, onClose])

  const remove = async (id: string) => {
    try {
      await deleteMessage(id)
      setItems((m) => m?.filter((x) => x.id !== id) ?? null)
    } catch {
      toast('Could not delete the message.')
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-brand-900/40 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="msg-title" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex max-h-[min(680px,100%)] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-cream shadow-lift ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 id="msg-title" className="font-display text-xl font-semibold">Messages</h2>
            <p className="font-mono text-xs text-faint">{slug ? `workwindow.web.app/${slug}` : portfolio.name}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col gap-3 overflow-auto p-5 scrollbar-thin">
          {items === null && (
            <p className="flex items-center gap-2 text-sm text-muted">
              <Loader2 size={16} className="animate-spin" /> Loading…
            </p>
          )}
          {items?.length === 0 && <p className="py-8 text-center text-sm text-muted">No messages yet. Visitors can write to you from the contact section of your live page.</p>}
          {items?.map((m) => (
            <article key={m.id} className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{m.name}</div>
                  <a href={`mailto:${m.email}`} className="text-sm text-brand-600 hover:underline">{m.email}</a>
                </div>
                <div className="flex flex-none items-center gap-1">
                  <span className="text-xs text-faint">{m.createdAt && new Date(m.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
                  <a href={`mailto:${m.email}`} aria-label="Reply by email" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-sand hover:text-ink">
                    <Mail size={15} />
                  </a>
                  <button onClick={() => remove(m.id)} aria-label="Delete message" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-700">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-2">{m.message}</p>
            </article>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Card({ r, onEdit, onDelete, onMessages }: { r: PortfolioRecord; onEdit: () => void; onDelete: () => void; onMessages: () => void }) {
  const views = r.views
  const live = r.live && r.slug

  return (
    <motion.article layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-black/5">
      <button onClick={onEdit} className="relative block overflow-hidden border-b border-line text-left" aria-label={`Edit ${r.name}`}>
        <ScaledPreview doc={r.doc} width={1240} ratio={0.56} />
        <span className="absolute inset-0 grid place-items-center bg-brand-900/0 opacity-0 transition group-hover:bg-brand-900/30 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow">
            <Pencil size={14} /> Edit
          </span>
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{r.name}</h3>
            <p className="text-xs text-faint">
              {templateById(r.doc.design.template).name} · Edited {when(r)}
            </p>
          </div>
          <span className={`flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${live ? 'bg-brand-50 text-brand-600' : 'bg-sand text-muted'}`}>{live ? 'Live' : 'Draft'}</span>
        </div>
        {live && (
          <a href={`${SITE_ORIGIN}/${r.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 truncate font-mono text-[12.5px] text-brand-600 hover:underline">
            <Globe size={13} className="flex-none" /> workwindow.web.app/{r.slug}
          </a>
        )}
        <div className="mt-auto flex items-center gap-1 pt-1">
          {r.slug && (
            <span className="mr-auto inline-flex items-center gap-1.5 text-xs text-muted" title="Visits to your live page (one per visitor session)">
              <Eye size={14} /> {views ?? '–'} {views === 1 ? 'view' : 'views'}
            </span>
          )}
          {!r.slug && <span className="mr-auto text-xs text-faint">Not published yet</span>}
          {r.slug && (
            <Button variant="ghost" size="sm" onClick={onMessages}>
              <Inbox size={14} /> Messages
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onDelete} aria-label={`Delete ${r.name}`} className="hover:bg-red-50 hover:text-red-700">
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export default function Dashboard() {
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const cloudId = useBuilder((s) => s.cloudId)
  const draftEdited = useBuilder((s) => s.savedAt != null)
  const [items, setItems] = useState<PortfolioRecord[] | null>(null)
  const [busy, setBusy] = useState<'new' | 'draft' | null>(null)
  const [inbox, setInbox] = useState<PortfolioRecord | null>(null)
  const closeInbox = useCallback(() => setInbox(null), [])

  useEffect(() => {
    document.title = 'My portfolios · WorkWindow'
  }, [])

  useEffect(() => {
    if (ready && !user) navigate('/login?next=/dashboard', { replace: true })
  }, [ready, user, navigate])

  const refresh = useCallback(() => {
    if (!user) return
    listPortfolios()
      .then(setItems)
      .catch(() => {
        setItems([])
        toast('Could not load your portfolios.')
      })
  }, [user])

  useEffect(refresh, [refresh])

  const create = async (fromDraft: boolean) => {
    if (!user) return
    setBusy(fromDraft ? 'draft' : 'new')
    try {
      const d = fromDraft ? await liftImages(useBuilder.getState().doc) : samplePortfolio()
      const id = await createPortfolio(d)
      useBuilder.getState().load(d, id)
      navigate('/builder')
    } catch (e) {
      toast(e instanceof TooLargeError ? e.message : 'Could not create the portfolio.')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (r: PortfolioRecord) => {
    const msg = r.live ? `Delete "${r.name}"? Its live page at /${r.slug} and its messages will be removed too.` : `Delete "${r.name}"? This cannot be undone.`
    if (!window.confirm(msg)) return
    try {
      await deletePortfolio(r.id)
      if (r.id === useBuilder.getState().cloudId) useBuilder.getState().reset()
      setItems((x) => x?.filter((i) => i.id !== r.id) ?? null)
      toast('Portfolio deleted')
    } catch {
      toast('Could not delete the portfolio.')
    }
  }

  const name = user?.displayName?.split(' ')[0]

  return (
    <div className="min-h-dvh bg-cream">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden max-w-[220px] truncate text-sm text-muted md:inline">{user?.email}</span>
            <Button
              variant="ghost"
              size="md"
              onClick={async () => {
                await signOut()
                navigate('/')
              }}
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-[clamp(30px,4vw,44px)] font-semibold leading-tight">{name ? `Hi ${name}, your portfolios` : 'Your portfolios'}</h1>
            <p className="mt-1 text-muted">Edit, publish and see who is getting in touch.</p>
          </div>
          <Button size="lg" onClick={() => create(false)} disabled={busy !== null}>
            {busy === 'new' ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />} New portfolio
          </Button>
        </div>

        {ready && user && !cloudId && draftEdited && (
          <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl bg-gold-300/40 p-4 ring-1 ring-gold-400/50">
            <CloudUpload size={20} className="flex-none text-gold-600" />
            <p className="min-w-[220px] flex-1 text-sm text-ink-2">You have a draft saved only in this browser. Save it to your account to keep it safe and publish it.</p>
            <Button variant="primary" size="md" onClick={() => create(true)} disabled={busy !== null}>
              {busy === 'draft' ? <Loader2 size={15} className="animate-spin" /> : null} Save draft to account
            </Button>
          </div>
        )}

        {items === null ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[300px] animate-pulse rounded-3xl bg-sand/70" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-sand-2 bg-paper/60 px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-semibold">No portfolios yet</h2>
            <p className="max-w-sm text-sm text-muted">Start from the sample and replace it with your own work, or browse the templates first.</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <Button size="md" onClick={() => create(false)} disabled={busy !== null}>
                <Plus size={16} /> New portfolio
              </Button>
              <Link to="/#templates" className="inline-flex h-10 items-center rounded-full px-5 text-sm font-semibold text-ink-2 ring-1 ring-line hover:bg-white">
                Browse templates
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {items.map((r) => (
                <Card key={r.id} r={r} onEdit={() => navigate(`/builder?id=${r.id}`)} onDelete={() => remove(r)} onMessages={() => setInbox(r)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <AnimatePresence>{inbox && <Messages portfolio={inbox} onClose={closeInbox} />}</AnimatePresence>
    </div>
  )
}
