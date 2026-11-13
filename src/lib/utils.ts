export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export const uid = () => Math.random().toString(36).slice(2, 9)

export function getPath(obj: unknown, path: string): any {
  return path.split('.').reduce<any>((o, k) => (o == null ? o : o[k]), obj)
}

export function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split('.')
  let o = obj
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]]
  o[keys[keys.length - 1]] = value
}

/** Text color (near-black or white) that reads on top of the given hex color. */
export function inkFor(hex: string) {
  const h = hex.replace('#', '')
  if (h.length < 6) return '#ffffff'
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.42 ? '#111111' : '#ffffff'
}

export const generatedCover = (h: number) =>
  `radial-gradient(120% 90% at 88% 8%, hsl(${h + 30} 90% 74%) 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, hsl(${h - 25} 72% 32%) 0%, transparent 62%), hsl(${h} 62% 50%)`

export const coverBackground = (p: { image: string; hue: number }) =>
  p.image ? `url('${p.image}') center / cover` : generatedCover(p.hue)

export const safeUrl = (u: string) => (/^https?:\/\//i.test(u || '') ? u : '#')

/**
 * Turns what someone typed into a link that is safe to render, or '' if it isn't one.
 * Accepts http(s) URLs and bare domains like "example.com/work" (https:// is added).
 * Any other scheme (javascript:, data:, mailto:…) is rejected.
 */
export function linkUrl(u: string | undefined): string {
  const s = (u ?? '').trim()
  if (!s) return ''
  if (/^https?:\/\/[^\s/]+\.[^\s]+/i.test(s)) return s
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s) && /^[a-z0-9-]+(\.[a-z0-9-]+)+([/?#]\S*)?$/i.test(s)) return `https://${s}`
  return ''
}

/** Downscale an uploaded image to keep the saved portfolio small. */
export function readImage(file: File, max = 1400, quality = 0.84): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = reject
    fr.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const sc = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * sc)
        c.height = Math.round(img.height * sc)
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', quality))
      }
      img.src = fr.result as string
    }
    fr.readAsDataURL(file)
  })
}
