import { samplePortfolio } from '@/lib/sample'
import type { Portfolio, TemplateId } from '@/lib/types'
import { templateById } from '@/templates/registry'

const cache = new Map<string, Portfolio>()

/** Sample portfolio dressed in a given template, for showcases. */
export function demoDoc(id: TemplateId, mode: 'light' | 'dark' = templateById(id).defaultMode ?? 'light'): Portfolio {
  const key = `${id}:${mode}`
  if (!cache.has(key)) {
    const d = samplePortfolio()
    const t = templateById(id)
    d.design = { ...d.design, template: id, accent: t.accent, mode, radius: t.radius ?? 14 }
    cache.set(key, d)
  }
  return cache.get(key)!
}
