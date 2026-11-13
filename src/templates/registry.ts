import type { FontKey, Mode, TemplateId } from '@/lib/types'

export interface TemplateMeta {
  id: TemplateId
  name: string
  tagline: string
  description: string
  bestFor: string[]
  accent: string
  /** Colors used to draw the template's thumbnail in the app. */
  thumb: { bg: string; fg: string; card: string }
  displayFont: string
  /** Weight and style used for the display font in thumbnails. */
  displayWeight?: number
  displayItalic?: boolean
  /** Appearance and corner radius the template looks best in. */
  defaultMode?: Mode
  radius?: number
  /** Uses the motion layer (`.fx`): load stagger, scroll reveals and hover effects. */
  animated?: boolean
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    tagline: 'Serif headlines with room to breathe',
    description: 'A magazine-style layout with large serif headlines, generous whitespace and a two-column project grid.',
    bestFor: ['Product designers', 'Writers', 'Strategists'],
    accent: '#2F4BFF',
    thumb: { bg: '#FBFBF8', fg: '#17181B', card: '#ECECE6' },
    displayFont: "'Fraunces', Georgia, serif",
    displayItalic: true,
  },
  {
    id: 'luxe',
    name: 'Luxe',
    tagline: 'Forest green, gold and fine serif type',
    description: 'A rich, high-contrast look with Playfair Display, gold details and an elegant dark ground. Made for premium personal brands.',
    bestFor: ['Architects', 'Interior designers', 'Consultants'],
    accent: '#C9A961',
    thumb: { bg: '#0F2A22', fg: '#F3EEE2', card: '#1A3A30' },
    displayFont: "'Playfair Display', Georgia, serif",
    defaultMode: 'dark',
  },
  {
    id: 'swiss',
    name: 'Grid',
    tagline: 'Heavy type on a strict three-column grid',
    description: 'International Typographic Style: uppercase grotesk headlines, hard rules and square project tiles.',
    bestFor: ['Brand designers', 'Art directors', 'Studios'],
    accent: '#E5484D',
    thumb: { bg: '#FFFFFF', fg: '#0B0B0B', card: '#EDEDED' },
    displayFont: "'Archivo', system-ui, sans-serif",
    displayWeight: 800,
    radius: 0,
  },
  {
    id: 'mono',
    name: 'Terminal',
    tagline: 'Monospace and list-first, for engineers',
    description: 'A focused, text-forward layout set in JetBrains Mono, with projects shown as a scannable changelog.',
    bestFor: ['Engineers', 'Data scientists', 'Indie hackers'],
    accent: '#0E9F6E',
    thumb: { bg: '#0C100E', fg: '#D9E4DC', card: '#18201B' },
    displayFont: "'JetBrains Mono', ui-monospace, monospace",
    defaultMode: 'dark',
  },
  {
    id: 'studio',
    name: 'Studio',
    tagline: 'Soft cards with a featured project',
    description: 'Rounded cards on a calm grey ground, with your lead project shown full width. Friendly and image-led.',
    bestFor: ['Illustrators', 'Photographers', 'UI designers'],
    accent: '#D6409F',
    thumb: { bg: '#ECEDEF', fg: '#141518', card: '#FFFFFF' },
    displayFont: "'Instrument Serif', Georgia, serif",
    radius: 18,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Glass cards over a drifting glow',
    description: 'Frosted-glass panels float over slow-moving aurora light. Headlines rise in on load and every section fades up as it scrolls into view.',
    bestFor: ['AI and SaaS founders', 'Product designers', 'Creative technologists'],
    accent: '#8B5CF6',
    thumb: { bg: 'radial-gradient(80% 90% at 85% 10%, #8B5CF6aa, transparent 60%), radial-gradient(70% 80% at 0% 100%, #06B6D4aa, transparent 60%), #0B0B1A', fg: '#F2F1FF', card: 'rgb(255 255 255 / .12)' },
    displayFont: "'Space Grotesk', system-ui, sans-serif",
    displayWeight: 700,
    defaultMode: 'dark',
    radius: 20,
    animated: true,
  },
  {
    id: 'bento',
    name: 'Bento',
    tagline: 'Everything in tiles that pop into place',
    description: 'Your stats, projects and skills arranged as a bento grid of rounded tiles. Tiles spring into place on load and lift when hovered.',
    bestFor: ['UI designers', 'Indie makers', 'Developer advocates'],
    accent: '#F97316',
    thumb: { bg: '#F4F1EA', fg: '#1C1917', card: '#FFFFFF' },
    displayFont: "'Bricolage Grotesque', system-ui, sans-serif",
    displayWeight: 800,
    radius: 24,
    animated: true,
  },
  {
    id: 'brutal',
    name: 'Brutal',
    tagline: 'Thick borders, hard shadows, loud color',
    description: 'Neo-brutalism: black outlines, offset shadows and a bright ground. Cards wobble on hover and your skills run across the page in a ticker.',
    bestFor: ['Brand designers', 'Creative developers', 'Content creators'],
    accent: '#FF5C00',
    thumb: { bg: '#FFE24A', fg: '#000000', card: '#FFFFFF' },
    displayFont: "'Archivo', system-ui, sans-serif",
    displayWeight: 800,
    radius: 6,
    animated: true,
  },
  {
    id: 'neon',
    name: 'Neon',
    tagline: 'Glowing type on a moving cyber grid',
    description: 'A dark, cinematic look with glowing accents, a perspective grid scrolling under the hero and a soft scanline texture.',
    bestFor: ['Game developers', 'Web3 builders', 'Motion designers'],
    accent: '#22D3EE',
    thumb: { bg: 'linear-gradient(180deg, #07070D 55%, #22D3EE33)', fg: '#E6FCFF', card: '#12121E' },
    displayFont: "'Unbounded', system-ui, sans-serif",
    displayWeight: 800,
    defaultMode: 'dark',
    radius: 10,
    animated: true,
  },
  {
    id: 'kinetic',
    name: 'Kinetic',
    tagline: 'Oversized type that moves',
    description: 'Huge headlines that slide up line by line, a scrolling marquee of skills and project titles that swap to the accent color on hover.',
    bestFor: ['Art directors', 'Motion designers', 'Agencies'],
    accent: '#D4FF3A',
    thumb: { bg: '#0E0E0E', fg: '#F5F5F0', card: '#1C1C1C' },
    displayFont: "'Syne', system-ui, sans-serif",
    displayWeight: 800,
    defaultMode: 'dark',
    radius: 0,
    animated: true,
  },
  {
    id: 'holo',
    name: 'Holo',
    tagline: 'Iridescent Y2K shimmer',
    description: 'Pastel holographic gradients that shift slowly, pill buttons and chrome-like highlights. Playful but tidy.',
    bestFor: ['Illustrators', 'Fashion and beauty', 'Social media designers'],
    accent: '#E040FB',
    thumb: { bg: 'linear-gradient(135deg, #FDE2FF, #D7E9FF 45%, #D9FFF1 75%, #FFF3D1)', fg: '#1B1530', card: 'rgb(255 255 255 / .7)' },
    displayFont: "'Instrument Serif', Georgia, serif",
    displayItalic: true,
    radius: 22,
    animated: true,
  },
]

export const templateById = (id: TemplateId) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]

export const FONT_PAIRS: Record<FontKey, { label: string; stack: [string, string] | null }> = {
  default: { label: 'Template default', stack: null },
  editorial: { label: 'Fraunces + Inter', stack: ["'Fraunces', Georgia, serif", "'Inter', system-ui, sans-serif"] },
  luxe: { label: 'Playfair Display + Inter', stack: ["'Playfair Display', Georgia, serif", "'Inter', system-ui, sans-serif"] },
  swiss: { label: 'Archivo', stack: ["'Archivo', system-ui, sans-serif", "'Archivo', system-ui, sans-serif"] },
  studio: { label: 'Instrument Serif + Inter', stack: ["'Instrument Serif', Georgia, serif", "'Inter', system-ui, sans-serif"] },
  grotesk: { label: 'Space Grotesk + Inter', stack: ["'Space Grotesk', system-ui, sans-serif", "'Inter', system-ui, sans-serif"] },
  mono: { label: 'JetBrains Mono', stack: ["'JetBrains Mono', ui-monospace, monospace", "'JetBrains Mono', ui-monospace, monospace"] },
  bricolage: { label: 'Bricolage Grotesque + Inter', stack: ["'Bricolage Grotesque', system-ui, sans-serif", "'Inter', system-ui, sans-serif"] },
  syne: { label: 'Syne + Inter', stack: ["'Syne', system-ui, sans-serif", "'Inter', system-ui, sans-serif"] },
  unbounded: { label: 'Unbounded + Inter', stack: ["'Unbounded', system-ui, sans-serif", "'Inter', system-ui, sans-serif"] },
}

export const ACCENTS = ['#2F4BFF', '#12493B', '#C9A961', '#E5484D', '#0E9F6E', '#E8890C', '#D6409F', '#111111', '#8B5CF6', '#22D3EE', '#D4FF3A', '#FF5C00']

export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Archivo:wght@400;600;800&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@500;700&family=Bricolage+Grotesque:wght@400;600;800&family=Syne:wght@600;800&family=Unbounded:wght@500;800&display=swap'
