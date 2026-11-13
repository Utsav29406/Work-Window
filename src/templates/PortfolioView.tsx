import type { CSSProperties, ReactNode } from 'react'
import type { Portfolio, Section } from '@/lib/types'
import { coverBackground, inkFor, linkUrl, safeUrl } from '@/lib/utils'
import { FONT_PAIRS, templateById } from './registry'

const NAV: Partial<Record<Section['k'], string>> = { work: 'Work', experience: 'Experience', skills: 'Skills', contact: 'Contact' }

/** Stagger index for CSS animations. */
const idx = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Renders `*word*` as an accent-colored emphasis. Each word is wrapped in a
 * span with its index so animated templates can reveal the headline word by word.
 */
function Emph({ text }: { text: string }) {
  let n = 0
  const words = (chunk: string) =>
    chunk.split(/(\s+)/).map((w, j) => (/^\s+$/.test(w) || !w ? w : <span className="w" style={idx(n++)} key={j}>{w}</span>))
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, i) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={i}>{words(part.slice(1, -1))}</em> : <span key={i}>{words(part)}</span>,
      )}
    </>
  )
}

function SectionHead({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="pf-sh">
      <h2>{title}</h2>
      {aside ? <span>{aside}</span> : null}
    </div>
  )
}

interface Props {
  doc: Portfolio
  /** Export mode drops editor-only hints and uses real mailto links. */
  exportMode?: boolean
  /** Extra content for the contact section, e.g. a message form on a published page. */
  contactSlot?: ReactNode
  /** Extra content for the footer, e.g. a "Made with" credit. */
  footerSlot?: ReactNode
}

export function PortfolioView({ doc, exportMode = false, contactSlot, footerSlot }: Props) {
  const { design: d, profile: P } = doc
  const meta = templateById(d.template)
  const fonts = FONT_PAIRS[d.fonts]?.stack
  const style = {
    '--a': d.accent,
    '--a-ink': inkFor(d.accent),
    '--r': `${d.radius}px`,
    ...(fonts ? { '--fd': fonts[0], '--fb': fonts[1] } : {}),
  } as CSSProperties

  const on = doc.sections.filter((s) => s.on)
  const has = (k: Section['k']) => on.some((s) => s.k === k)
  const stats = doc.stats.filter((s) => s.v.trim())
  const eyebrow = [P.role, P.location].filter(Boolean)
  const empty = (msg: string) => (exportMode ? null : <p className="pf-empty">{msg}</p>)

  const render = (s: Section) => {
    switch (s.k) {
      case 'work': {
        const n = doc.projects.length
        return (
          <section className="pf-sec" id="pf-work" key="work">
            <div className="pf-in">
              <SectionHead title={s.title} aside={n ? `${String(n).padStart(2, '0')} project${n === 1 ? '' : 's'}` : undefined} />
              {n ? (
                <div className="pf-grid">
                  {doc.projects.map((p, i) => {
                    const href = linkUrl(p.url)
                    return (
                    <article className="pf-card" key={p.id} style={idx(i)}>
                      <div className="pf-cover" style={{ background: coverBackground(p) }} role="img" aria-label={`${p.title} cover`}>
                        {!p.image && <span className="gen">{p.title}</span>}
                      </div>
                      <div className="pf-body">
                        <div className="pf-meta">
                          <h3>{p.title}</h3>
                          <span>{p.year}</span>
                        </div>
                        {p.client && <div className="pf-client">{p.client}</div>}
                        {p.summary && <p>{p.summary}</p>}
                        {p.metric && <div className="pf-metric">{p.metric}</div>}
                        {p.tags.length > 0 && (
                          <div className="pf-tags">
                            {p.tags.map((t) => (
                              <span className="pf-tag" key={t}>{t}</span>
                            ))}
                          </div>
                        )}
                        {href && (
                          <a className="pf-plink" href={href} target="_blank" rel="noopener noreferrer" aria-label={`View ${p.title} (opens in a new tab)`}>
                            View project <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </div>
                    </article>
                    )
                  })}
                </div>
              ) : (
                empty('Add a project in the Content tab to fill this section.')
              )}
            </div>
          </section>
        )
      }
      case 'experience':
        return (
          <section className="pf-sec" id="pf-experience" key="experience">
            <div className="pf-in">
              <SectionHead title={s.title} />
              {doc.experience.length ? (
                <div>
                  {doc.experience.map((e, i) => (
                    <div className="pf-xr" key={e.id} style={idx(i)}>
                      <span className="y">{e.start} – {e.end}</span>
                      <div>
                        <h4>{e.role}</h4>
                        {e.note && <p>{e.note}</p>}
                      </div>
                      <span className="c">{e.company}</span>
                    </div>
                  ))}
                </div>
              ) : (
                empty('Add a role in the Content tab to fill this section.')
              )}
            </div>
          </section>
        )
      case 'skills':
        return (
          <section className="pf-sec" id="pf-skills" key="skills">
            <div className="pf-in">
              <SectionHead title={s.title} />
              {doc.skills.length ? (
                <div className="pf-skills">
                  {doc.skills.map((k, i) => (
                    <span className="pf-skill" key={k} style={idx(i)}>{k}</span>
                  ))}
                </div>
              ) : (
                empty('Add skills in the Content tab.')
              )}
            </div>
          </section>
        )
      case 'testimonial':
        if (!doc.testimonial.quote.trim()) return null
        return (
          <section className="pf-sec" id="pf-testimonial" key="testimonial">
            <div className="pf-in">
              <SectionHead title={s.title} />
              <figure className="pf-q">
                <blockquote className="pf-quote">“{doc.testimonial.quote}”</blockquote>
                <figcaption>
                  <b>{doc.testimonial.who}</b>
                  {doc.testimonial.role ? ` · ${doc.testimonial.role}` : ''}
                </figcaption>
              </figure>
            </div>
          </section>
        )
      case 'contact':
        return (
          <section className="pf-sec pf-contact" id="pf-contact" key="contact">
            <div className="pf-in">
              <p className="pf-eyebrow">{s.title}</p>
              {P.email &&
                (exportMode ? (
                  <a className="pf-mail" href={`mailto:${P.email}`}>{P.email}</a>
                ) : (
                  <span className="pf-mail">{P.email}</span>
                ))}
              <div className="pf-soc">
                {doc.links
                  .filter((l) => l.label)
                  .map((l) => (
                    <a key={l.id} href={safeUrl(l.url)} target="_blank" rel="noopener noreferrer">
                      {l.label} ↗
                    </a>
                  ))}
              </div>
              {contactSlot}
            </div>
          </section>
        )
    }
  }

  return (
    <div className={`pf t-${d.template} m-${d.mode} d-${d.density}${meta.animated ? ' fx' : ''}`} style={style}>
      <header className="pf-nav">
        <div className="pf-in">
          <a className="pf-logo" href="#pf-top">{P.name}</a>
          <nav className="pf-links">
            {on
              .filter((s) => NAV[s.k])
              .map((s) => (
                <a key={s.k} href={`#pf-${s.k}`}>{NAV[s.k]}</a>
              ))}
          </nav>
          {P.available && P.availText && (
            <span className="pf-avail">
              <i />
              {P.availText}
            </span>
          )}
        </div>
      </header>
      <main id="pf-top">
        <section className="pf-hero">
          <div className="pf-deco" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="pf-in">
            {eyebrow.length > 0 && (
              <p className="pf-eyebrow">
                {eyebrow.map((e, i) => (
                  <span key={i}>{i > 0 ? <span aria-hidden="true">/ </span> : null}{e}</span>
                ))}
              </p>
            )}
            <h1 className="pf-h1"><Emph text={P.headline || P.name} /></h1>
            {P.bio && <p className="pf-bio">{P.bio}</p>}
            <div className="pf-cta">
              {has('work') && <a className="pf-btn pri" href="#pf-work">See selected work</a>}
              {has('contact') && <a className="pf-btn" href="#pf-contact">Get in touch</a>}
            </div>
            {stats.length > 0 && (
              <div className="pf-stats">
                {stats.map((x, i) => (
                  <div className="pf-stat" key={i} style={idx(i)}>
                    <b>{x.v}</b>
                    <span>{x.l}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        {has('skills') && doc.skills.length > 0 && (
          <div className="pf-marq" aria-hidden="true">
            <div className="pf-marq-t">
              {[...doc.skills, ...doc.skills].map((k, i) => (
                <span key={i}>{k}</span>
              ))}
            </div>
          </div>
        )}
        {on.map(render)}
      </main>
      <footer className="pf-foot">
        <div className="pf-in">
          <span>© {new Date().getFullYear()} {P.name}</span>
          <span>{P.location}</span>
          {footerSlot}
        </div>
      </footer>
    </div>
  )
}
