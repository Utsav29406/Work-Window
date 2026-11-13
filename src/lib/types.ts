export type TemplateId =
  | 'editorial' | 'luxe' | 'swiss' | 'mono' | 'studio'
  | 'aurora' | 'bento' | 'brutal' | 'neon' | 'kinetic' | 'holo'
export type FontKey = 'default' | 'editorial' | 'luxe' | 'swiss' | 'studio' | 'grotesk' | 'mono' | 'bricolage' | 'syne' | 'unbounded'
export type Density = 'compact' | 'regular' | 'airy'
export type Mode = 'light' | 'dark'
export type SectionKey = 'work' | 'experience' | 'skills' | 'testimonial' | 'contact'
export type Device = 'desktop' | 'tablet' | 'phone'

export interface Project {
  id: string
  title: string
  year: string
  client: string
  tags: string[]
  summary: string
  metric: string
  /** Optional link to the live product, case study or repository. May be missing on older saves. */
  url?: string
  hue: number
  image: string
}

export interface Role {
  id: string
  start: string
  end: string
  role: string
  company: string
  note: string
}

export interface SocialLink {
  id: string
  label: string
  url: string
}

export interface Section {
  k: SectionKey
  title: string
  on: boolean
}

export interface Portfolio {
  profile: {
    name: string
    role: string
    location: string
    headline: string
    bio: string
    email: string
    available: boolean
    availText: string
  }
  stats: { v: string; l: string }[]
  projects: Project[]
  experience: Role[]
  skills: string[]
  testimonial: { quote: string; who: string; role: string }
  links: SocialLink[]
  site: { domain: string; title: string; desc: string }
  design: {
    template: TemplateId
    accent: string
    fonts: FontKey
    radius: number
    density: Density
    mode: Mode
  }
  sections: Section[]
}
