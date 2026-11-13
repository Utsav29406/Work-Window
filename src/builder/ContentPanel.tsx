import { useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { AtSign, BarChart3, Briefcase, FolderKanban, ImagePlus, Plus, Quote, Sparkles, Trash2, User, X } from 'lucide-react'
import { useBuilder } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { uploadImage } from '@/lib/cloud'
import { coverBackground, cn, linkUrl, readImage, uid } from '@/lib/utils'
import type { Project, Role } from '@/lib/types'
import { TextArea, TextField, inputClass } from '@/components/ui/Field'
import { Switch } from '@/components/ui/Controls'
import { toast } from '@/components/ui/Toast'
import { Group } from './Group'
import { ItemCard } from './ItemCard'

const addBtn =
  'flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sand-2 text-[13px] font-medium text-muted transition hover:border-brand-500 hover:bg-brand-50/60 hover:text-brand-600'

function useListOps<K extends 'projects' | 'experience' | 'links'>(key: K) {
  const update = useBuilder((s) => s.update)
  return {
    move: (i: number, dir: -1 | 1) =>
      update((d) => {
        const a = d[key] as unknown[]
        const j = i + dir
        if (j < 0 || j >= a.length) return
        ;[a[i], a[j]] = [a[j], a[i]]
      }),
    remove: (i: number, what: string) => {
      update((d) => {
        ;(d[key] as unknown[]).splice(i, 1)
      })
      toast(`${what} removed`, true)
    },
  }
}

function Projects() {
  const projects = useBuilder((s) => s.doc.projects)
  const update = useBuilder((s) => s.update)
  const [open, setOpen] = useState<string | null>(null)
  const ops = useListOps('projects')
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const add = () => {
    const p: Project = { id: uid(), title: 'New project', year: String(new Date().getFullYear()), client: '', tags: [], summary: '', metric: '', url: '', hue: Math.floor(Math.random() * 360), image: '' }
    update((d) => void d.projects.push(p))
    setOpen(p.id)
  }

  const upload = async (i: number, file?: File) => {
    if (!file) return
    try {
      const user = useAuth.getState().user
      let url = await readImage(file)
      if (user) {
        toast('Uploading image…')
        const hosted = await uploadImage(url)
        // If the upload fails, keep a smaller inline copy so the portfolio stays under the save limit.
        url = hosted ?? (await readImage(file, 1000, 0.76))
      }
      update((d) => void (d.projects[i].image = url))
      toast('Cover image added')
    } catch {
      toast('That file could not be read as an image. Try a JPG or PNG.')
    }
  }

  return (
    <Group title="Projects" count={projects.length} icon={<FolderKanban size={16} />} defaultOpen>
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {projects.map((p, i) => (
            <ItemCard
              key={p.id}
              title={p.title || 'Untitled project'}
              subtitle={[p.year, p.client].filter(Boolean).join(' · ')}
              thumb={<span className="h-9 w-12 flex-none rounded-lg ring-1 ring-black/5" style={{ background: coverBackground(p) }} />}
              open={open === p.id}
              onToggle={() => setOpen(open === p.id ? null : p.id)}
              onMove={(dir) => ops.move(i, dir)}
              onDelete={() => ops.remove(i, 'Project')}
              first={i === 0}
              last={i === projects.length - 1}
            >
              <TextField label="Title" path={`projects.${i}.title`} />
              <div className="grid grid-cols-2 gap-2.5">
                <TextField label="Year" path={`projects.${i}.year`} />
                <TextField label="Client" path={`projects.${i}.client`} />
              </div>
              <TextArea label="Summary" path={`projects.${i}.summary`} placeholder="What you made, for whom, and why it mattered." />
              <TextField label="Outcome" path={`projects.${i}.metric`} placeholder="Conversion up 22%" hint="One measurable result. Numbers read best." />
              <TextField
                label="Project link"
                path={`projects.${i}.url`}
                placeholder="https://"
                hint={p.url?.trim() && !linkUrl(p.url) ? 'This does not look like a web address, so it will not be shown.' : 'Optional. A live site, case study or repository.'}
              />
              <TextField label="Tags" path={`projects.${i}.tags`} csv hint="Separate with commas." />
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-ink-2">Cover</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => fileRefs.current[p.id]?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      upload(i, e.dataTransfer.files[0])
                    }}
                    className="group relative aspect-[4/3] w-28 flex-none overflow-hidden rounded-xl ring-1 ring-black/10"
                    style={{ background: coverBackground(p) }}
                    aria-label="Upload cover image"
                  >
                    <span className="absolute inset-0 grid place-items-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
                      <ImagePlus size={18} />
                    </span>
                  </button>
                  <input ref={(el) => void (fileRefs.current[p.id] = el)} type="file" accept="image/*" hidden onChange={(e) => upload(i, e.target.files?.[0])} />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    {p.image ? (
                      <button onClick={() => update((d) => void (d.projects[i].image = ''))} className="inline-flex items-center gap-1.5 self-start rounded-full bg-white px-3 py-1.5 text-xs font-medium ring-1 ring-line hover:ring-ink/20">
                        <Trash2 size={12} /> Use generated cover
                      </button>
                    ) : (
                      <>
                        <span className="text-xs text-faint">Click or drop an image, or pick a color:</span>
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={p.hue}
                          aria-label="Generated cover color"
                          onChange={(e) => update((d) => void (d.projects[i].hue = +e.target.value), `projects.${i}.hue`)}
                          className="h-2.5 w-full cursor-pointer appearance-none rounded-full [background:linear-gradient(90deg,hsl(0_75%_58%),hsl(60_75%_52%),hsl(120_60%_45%),hsl(180_65%_45%),hsl(240_70%_60%),hsl(300_65%_55%),hsl(360_75%_58%))] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-white"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </ItemCard>
          ))}
        </AnimatePresence>
        {!projects.length && <p className="rounded-xl border border-dashed border-line p-4 text-center text-[13px] text-faint">No projects yet. Add your strongest piece first.</p>}
      </div>
      <button className={addBtn} onClick={add}><Plus size={15} /> Add project</button>
    </Group>
  )
}

function Experience() {
  const roles = useBuilder((s) => s.doc.experience)
  const update = useBuilder((s) => s.update)
  const [open, setOpen] = useState<string | null>(null)
  const ops = useListOps('experience')
  const add = () => {
    const r: Role = { id: uid(), start: String(new Date().getFullYear()), end: 'Now', role: 'New role', company: '', note: '' }
    update((d) => void d.experience.unshift(r))
    setOpen(r.id)
  }
  return (
    <Group title="Experience" count={roles.length} icon={<Briefcase size={16} />}>
      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {roles.map((r, i) => (
            <ItemCard
              key={r.id}
              title={r.role || 'Untitled role'}
              subtitle={[r.company, `${r.start}–${r.end}`].filter(Boolean).join(' · ')}
              thumb={<span className="grid h-9 w-12 flex-none place-items-center rounded-lg bg-sand font-mono text-[11px] text-ink-2">{r.start}</span>}
              open={open === r.id}
              onToggle={() => setOpen(open === r.id ? null : r.id)}
              onMove={(dir) => ops.move(i, dir)}
              onDelete={() => ops.remove(i, 'Role')}
              first={i === 0}
              last={i === roles.length - 1}
            >
              <TextField label="Role" path={`experience.${i}.role`} />
              <TextField label="Company" path={`experience.${i}.company`} />
              <div className="grid grid-cols-2 gap-2.5">
                <TextField label="Start" path={`experience.${i}.start`} />
                <TextField label="End" path={`experience.${i}.end`} placeholder="Now" />
              </div>
              <TextArea label="What you did" path={`experience.${i}.note`} rows={2} />
            </ItemCard>
          ))}
        </AnimatePresence>
      </div>
      <button className={addBtn} onClick={add}><Plus size={15} /> Add role</button>
    </Group>
  )
}

function Skills() {
  const skills = useBuilder((s) => s.doc.skills)
  const update = useBuilder((s) => s.update)
  const [v, setV] = useState('')
  const add = () => {
    const s = v.trim().replace(/,$/, '')
    if (!s) return
    if (!skills.includes(s)) update((d) => void d.skills.push(s))
    setV('')
  }
  return (
    <Group title="Skills" count={skills.length} icon={<Sparkles size={16} />}>
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-line bg-paper p-2 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10">
        {skills.map((s, i) => (
          <span key={s} className="inline-flex items-center gap-0.5 rounded-full bg-white py-1 pl-3 pr-1 text-[12.5px] ring-1 ring-line">
            {s}
            <button aria-label={`Remove ${s}`} onClick={() => update((d) => void d.skills.splice(i, 1))} className="grid h-5 w-5 place-items-center rounded-full text-faint hover:bg-sand hover:text-ink">
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={v}
          onChange={(e) => (e.target.value.endsWith(',') ? (setV(e.target.value), setTimeout(add)) : setV(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            } else if (e.key === 'Backspace' && !v && skills.length) update((d) => void d.skills.pop())
          }}
          onBlur={add}
          placeholder="Add a skill…"
          aria-label="Add a skill"
          className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-faint"
        />
      </div>
      <p className="text-xs text-faint">Press Enter or comma to add. Backspace on an empty field removes the last one.</p>
    </Group>
  )
}

function Links() {
  const links = useBuilder((s) => s.doc.links)
  const update = useBuilder((s) => s.update)
  const ops = useListOps('links')
  return (
    <>
      <div className="flex flex-col gap-2">
        {links.map((l, i) => (
          <div key={l.id} className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-end gap-2">
            <TextField label="Label" path={`links.${i}.label`} />
            <TextField label="URL" path={`links.${i}.url`} placeholder="https://" />
            <button onClick={() => ops.remove(i, 'Link')} aria-label="Remove link" className="mb-1 grid h-8 w-8 place-items-center rounded-lg text-faint hover:bg-red-50 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button className={addBtn} onClick={() => update((d) => void d.links.push({ id: uid(), label: '', url: '' }))}>
        <Plus size={15} /> Add link
      </button>
    </>
  )
}

export function ContentPanel() {
  const available = useBuilder((s) => s.doc.profile.available)
  const statsLen = useBuilder((s) => s.doc.stats.length)
  const update = useBuilder((s) => s.update)
  return (
    <div className="flex flex-col gap-3">
      <Group title="Profile" icon={<User size={16} />} defaultOpen>
        <TextField label="Full name" path="profile.name" />
        <div className="grid grid-cols-2 gap-2.5">
          <TextField label="Role" path="profile.role" placeholder="Product Designer" />
          <TextField label="Location" path="profile.location" placeholder="City, Country" />
        </div>
        <TextArea label="Headline" path="profile.headline" rows={2} hint={<>Wrap a word in <code className="rounded bg-sand px-1">*asterisks*</code> to highlight it in your accent color.</>} />
        <TextArea label="Short bio" path="profile.bio" rows={5} count hint="Aim for 120 to 300 characters: what you do, for whom, and how." />
        <div className="flex items-center justify-between gap-3 rounded-xl bg-cream p-3 ring-1 ring-line">
          <div>
            <div className="text-[13px] font-semibold">Availability badge</div>
            <div className="text-xs text-faint">Shown in your site's navigation</div>
          </div>
          <Switch checked={available} label="Show availability badge" onChange={(v) => update((d) => void (d.profile.available = v))} />
        </div>
        <div className={cn(!available && 'pointer-events-none opacity-50')}>
          <TextField label="Badge text" path="profile.availText" placeholder="Open to new projects" />
        </div>
      </Group>

      <Group title="Highlights" icon={<BarChart3 size={16} />}>
        {Array.from({ length: statsLen }, (_, i) => (
          <div key={i} className="grid grid-cols-[100px_minmax(0,1fr)] gap-2.5">
            <TextField label={`Figure ${i + 1}`} path={`stats.${i}.v`} placeholder="12+" />
            <TextField label="Label" path={`stats.${i}.l`} placeholder="Years of practice" />
          </div>
        ))}
        <p className="text-xs text-faint">Leave a figure empty to hide it.</p>
      </Group>

      <Projects />
      <Experience />
      <Skills />

      <Group title="Testimonial" icon={<Quote size={16} />}>
        <TextArea label="Quote" path="testimonial.quote" />
        <div className="grid grid-cols-2 gap-2.5">
          <TextField label="Name" path="testimonial.who" />
          <TextField label="Title and company" path="testimonial.role" />
        </div>
      </Group>

      <Group title="Contact" icon={<AtSign size={16} />}>
        <TextField label="Email" path="profile.email" placeholder="you@example.com" />
        <Links />
      </Group>
    </div>
  )
}

export { inputClass }
