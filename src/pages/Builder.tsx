import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, Check as CloudCheck, Cloud, Eye, Laptop, LayoutGrid, Loader2, Moon, PenLine, Redo2, Rocket, Smartphone, Sun, Tablet, Undo2 } from 'lucide-react'
import { useBuilder } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { useCloudSync } from '@/lib/useCloudSync'
import type { Device, Mode, TemplateId } from '@/lib/types'
import { SAMPLE_NAME } from '@/lib/sample'
import { cn } from '@/lib/utils'
import { TEMPLATES } from '@/templates/registry'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Segmented } from '@/components/ui/Controls'
import { toast } from '@/components/ui/Toast'
import { ContentPanel } from '@/builder/ContentPanel'
import { DesignPanel } from '@/builder/DesignPanel'
import { LayoutPanel } from '@/builder/LayoutPanel'
import { Strength } from '@/builder/Strength'
import { Canvas, WIDTH } from '@/builder/Canvas'
import { ExportDialog } from '@/builder/ExportDialog'
import { PublishDialog } from '@/builder/PublishDialog'

type Tab = 'content' | 'design' | 'layout'

export default function Builder() {
  const doc = useBuilder((s) => s.doc)
  const { past, future, undo, redo, update, device, setDevice } = useBuilder()
  const [tab, setTab] = useState<Tab>('content')
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  const [exportOpen, setExportOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [params, setParams] = useSearchParams()
  const { user, ready } = useAuth()
  const { cloudId, cloudState, cloudError } = useBuilder()
  useCloudSync()

  // ?publish=1 (coming back from sign-in) opens the publish dialog.
  useEffect(() => {
    if (params.get('publish') && ready) {
      setPublishOpen(true)
      params.delete('publish')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // ?template=luxe from the landing page applies that template once.
  useEffect(() => {
    const t = params.get('template') as TemplateId | null
    const meta = TEMPLATES.find((x) => x.id === t)
    if (meta) {
      update((d) => {
        d.design.template = meta.id
        d.design.accent = meta.accent
        d.design.mode = meta.defaultMode ?? 'light'
        if (meta.radius != null) d.design.radius = meta.radius
      })
      toast(`${meta.name} template applied`)
      params.delete('template')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.title = `${doc.profile.name || 'Untitled'} · WorkWindow`
  }, [doc.profile.name])

  // Undo / redo shortcuts outside text fields (fields keep their own native undo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setPublishOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  const goTab = (t: Tab) => {
    setTab(t)
    setView('edit')
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-cream">
      {/* Top bar */}
      <header className="z-20 flex flex-none flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-cream/90 px-4 pb-2.5 pt-[calc(10px+env(safe-area-inset-top))] backdrop-blur-md sm:px-5">
        <Logo compact />
        <span className="hidden h-6 w-px bg-line md:block" />
        <div className="order-3 flex min-w-0 basis-full items-center gap-2.5 md:order-none md:basis-auto md:flex-1">
          <span className="truncate text-sm font-semibold">{doc.profile.name || 'Untitled'}</span>
          {doc.profile.name === SAMPLE_NAME && <span className="flex-none rounded-full bg-gold-300/60 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-gold-600">Sample</span>}
          <SaveStatus signedIn={!!user} cloudId={cloudId} state={cloudState} error={cloudError} />
        </div>

        <Segmented<Device>
          className="hidden lg:inline-flex"
          layoutId="device"
          ariaLabel="Preview device"
          value={device}
          onChange={setDevice}
          options={[
            { value: 'desktop', label: <><Laptop size={14} /> Desktop</>, title: `${WIDTH.desktop}px` },
            { value: 'tablet', label: <><Tablet size={14} /> Tablet</>, title: `${WIDTH.tablet}px` },
            { value: 'phone', label: <><Smartphone size={14} /> Phone</>, title: `${WIDTH.phone}px` },
          ]}
        />

        <div className="ml-auto flex items-center gap-1">
          <Segmented<'edit' | 'preview'>
            className="mr-1 lg:hidden"
            size="sm"
            layoutId="mview"
            value={view}
            onChange={setView}
            ariaLabel="Switch view"
            options={[
              { value: 'edit', label: <><PenLine size={13} /> Edit</> },
              { value: 'preview', label: <><Eye size={13} /> Preview</> },
            ]}
          />
          <Button variant="ghost" size="icon" onClick={undo} disabled={!past.length} aria-label="Undo" title="Undo (Ctrl+Z)">
            <Undo2 size={17} />
          </Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={!future.length} aria-label="Redo" title="Redo (Ctrl+Shift+Z)">
            <Redo2 size={17} />
          </Button>
          {ready &&
            (user ? (
              <Link to="/dashboard" title="My portfolios" aria-label="My portfolios" className="ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition hover:ring-brand-500">
                {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <LayoutGrid size={16} />}
              </Link>
            ) : (
              <Link to={'/login?next=' + encodeURIComponent('/builder')} className="ml-1 hidden h-9 items-center rounded-full px-3.5 text-sm font-semibold text-ink-2 hover:bg-sand sm:inline-flex">
                Sign in
              </Link>
            ))}
          <Button size="md" className="ml-1" onClick={() => setPublishOpen(true)} title="Publish (Ctrl+E)">
            <Rocket size={15} /> <span className="hidden sm:inline">Publish</span>
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* Inspector */}
        <aside className={cn('min-h-0 flex-col border-r border-line bg-cream lg:flex', view === 'edit' ? 'flex' : 'hidden')}>
          <div className="flex-none px-4 pb-3 pt-4">
            <Segmented<Tab>
              className="w-full [&>button]:flex-1"
              layoutId="tab"
              value={tab}
              onChange={setTab}
              ariaLabel="Editor sections"
              options={[
                { value: 'content', label: 'Content' },
                { value: 'design', label: 'Design' },
                { value: 'layout', label: 'Layout' },
              ]}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.18 }}>
                {tab === 'content' && <ContentPanel />}
                {tab === 'design' && <DesignPanel />}
                {tab === 'layout' && <LayoutPanel />}
              </motion.div>
            </AnimatePresence>
          </div>
          <Strength onGo={goTab} />
        </aside>

        {/* Canvas */}
        <section className={cn('min-h-0 min-w-0 flex-col lg:flex', view === 'preview' ? 'flex' : 'hidden')}>
          <div className="flex flex-none items-center justify-between gap-3 border-b border-line bg-paper/60 px-4 py-2">
            <div className="flex items-center gap-3">
              <Segmented<Device>
                className="lg:hidden"
                size="sm"
                layoutId="device-m"
                value={device}
                onChange={setDevice}
                ariaLabel="Preview device"
                options={[
                  { value: 'desktop', label: <Laptop size={14} />, title: 'Desktop' },
                  { value: 'tablet', label: <Tablet size={14} />, title: 'Tablet' },
                  { value: 'phone', label: <Smartphone size={14} />, title: 'Phone' },
                ]}
              />
              <span className="hidden font-mono text-xs text-faint tabular-nums sm:inline">{WIDTH[device]} px · {TEMPLATES.find((t) => t.id === doc.design.template)?.name}</span>
            </div>
            <Segmented<Mode>
              size="sm"
              layoutId="mode-top"
              value={doc.design.mode}
              ariaLabel="Portfolio appearance"
              onChange={(m) => update((d) => void (d.design.mode = m))}
              options={[
                { value: 'light', label: <Sun size={14} />, title: 'Light' },
                { value: 'dark', label: <Moon size={14} />, title: 'Dark' },
              ]}
            />
          </div>
          <Canvas />
        </section>
      </div>

      <PublishDialog
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onDownload={() => {
          setPublishOpen(false)
          setExportOpen(true)
        }}
      />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}

function SaveStatus({ signedIn, cloudId, state, error }: { signedIn: boolean; cloudId: string | null; state: string; error: string | null }) {
  const base = 'hidden items-center gap-1 text-xs sm:flex'
  if (!signedIn || !cloudId) {
    if (signedIn && state === 'saving')
      return (
        <span className={cn(base, 'text-faint')}>
          <Loader2 size={13} className="animate-spin" /> Saving to your account…
        </span>
      )
    return (
      <span className={cn(base, 'text-faint')}>
        <CloudCheck size={14} /> Saved in this browser
      </span>
    )
  }
  if (state === 'error')
    return (
      <span className={cn(base, 'text-red-700')} title={error ?? undefined}>
        <AlertCircle size={14} /> Not saved
      </span>
    )
  if (state === 'saving')
    return (
      <span className={cn(base, 'text-faint')}>
        <Loader2 size={13} className="animate-spin" /> Saving…
      </span>
    )
  return (
    <span className={cn(base, 'text-faint')}>
      <Cloud size={14} /> Saved to your account
    </span>
  )
}
