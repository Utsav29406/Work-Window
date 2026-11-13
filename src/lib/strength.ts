import type { Portfolio } from './types'
import { linkUrl } from './utils'

export interface Check {
  label: string
  ok: boolean
  /** Which builder tab fixes it. */
  tab: 'content' | 'design' | 'layout'
}

export function strengthChecks(d: Portfolio): Check[] {
  const sec = (k: string) => d.sections.find((s) => s.k === k)
  return [
    { label: 'Name and role filled in', ok: !!(d.profile.name.trim() && d.profile.role.trim()), tab: 'content' },
    { label: 'Bio is at least 120 characters', ok: d.profile.bio.trim().length >= 120, tab: 'content' },
    { label: 'Three or more projects', ok: d.projects.length >= 3, tab: 'content' },
    { label: 'Every project has a summary', ok: d.projects.length > 0 && d.projects.every((p) => p.summary.trim()), tab: 'content' },
    { label: 'Most projects show an outcome', ok: d.projects.length > 0 && d.projects.filter((p) => p.metric.trim()).length >= Math.ceil(d.projects.length / 2), tab: 'content' },
    { label: 'At least one project links to live work', ok: d.projects.some((p) => !!linkUrl(p.url)), tab: 'content' },
    { label: 'Two or more roles in experience', ok: d.experience.length >= 2, tab: 'content' },
    { label: 'Six or more skills', ok: d.skills.length >= 6, tab: 'content' },
    { label: 'A testimonial is shown', ok: !!d.testimonial.quote.trim() && !!sec('testimonial')?.on, tab: 'content' },
    { label: 'Contact email added', ok: /.+@.+\..+/.test(d.profile.email), tab: 'content' },
    { label: 'Search description written', ok: d.site.desc.trim().length >= 50, tab: 'layout' },
  ]
}

export function strengthScore(d: Portfolio) {
  const c = strengthChecks(d)
  return Math.round((c.filter((x) => x.ok).length / c.length) * 100)
}
