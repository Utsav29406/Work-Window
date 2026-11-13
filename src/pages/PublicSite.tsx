import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { countView, getSite, sendMessage, type SiteRecord } from '@/lib/cloud'
import { PortfolioView } from '@/templates/PortfolioView'
import { PortfolioStyles } from '@/templates/PortfolioStyles'
import { LogoMark } from '@/components/ui/Logo'

function ContactForm({ slug }: { slug: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (f.get('website')) return setState('sent') // honeypot: bots fill hidden fields
    setState('sending')
    try {
      await sendMessage(slug, { name: String(f.get('name') ?? ''), email: String(f.get('email') ?? ''), message: String(f.get('message') ?? '') })
      setState('sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') return <p className="pf-form pf-form-note ok" role="status">Thanks, your message was sent.</p>

  return (
    <form className="pf-form" onSubmit={submit}>
      <label>
        Name
        <input name="name" required maxLength={100} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required maxLength={200} autoComplete="email" />
      </label>
      <label className="full">
        Message
        <textarea name="message" required maxLength={5000} />
      </label>
      <label className="hp" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="pf-btn pri" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send message'}
      </button>
      {state === 'error' && <p className="pf-form-note" role="alert">The message could not be sent. Please email instead.</p>}
    </form>
  )
}

export default function PublicSite() {
  const { slug = '' } = useParams()
  const [site, setSite] = useState<SiteRecord | null | undefined>(undefined)

  useEffect(() => {
    let alive = true
    setSite(undefined)
    getSite(slug.toLowerCase()).then((s) => alive && setSite(s && s.live ? s : null))
    return () => {
      alive = false
    }
  }, [slug])

  useEffect(() => {
    if (!site) return
    const { site: meta, profile } = site.doc
    document.title = meta.title || profile.name
    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.name = 'description'
      document.head.appendChild(desc)
    }
    desc.content = meta.desc || `${profile.name} · ${profile.role}`
    document.documentElement.style.scrollBehavior = 'smooth'
    void countView(slug.toLowerCase())
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [site, slug])

  if (site === undefined) return <div className="h-dvh bg-cream" aria-busy="true" />

  if (site === null)
    return (
      <div className="grid min-h-dvh place-items-center bg-cream px-6 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <LogoMark className="h-12 w-12" />
          <h1 className="font-display text-3xl font-semibold">Nothing here yet</h1>
          <p className="text-muted">
            <span className="font-mono text-ink">/{slug}</span> is not a published portfolio. It may have been taken offline, or the address is mistyped.
          </p>
          <Link to="/" className="mt-2 inline-flex h-11 items-center rounded-full bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700">
            Make your own portfolio
          </Link>
        </div>
      </div>
    )

  const showForm = site.doc.sections.some((s) => s.k === 'contact' && s.on)

  return (
    <div className="pf-wrap min-h-dvh">
      <PortfolioStyles />
      <PortfolioView
        doc={site.doc}
        exportMode
        contactSlot={showForm ? <ContactForm slug={slug.toLowerCase()} /> : null}
        footerSlot={
          <a className="pf-credit" href="/" target="_blank" rel="noopener">
            Made with WorkWindow
          </a>
        }
      />
    </div>
  )
}
