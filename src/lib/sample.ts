import type { Portfolio } from './types'
import { uid } from './utils'

export function samplePortfolio(): Portfolio {
  return {
    profile: {
      name: 'Mira Okafor',
      role: 'Product Designer',
      location: 'Lisbon, Portugal',
      headline: 'I design *calm software* for teams that ship every day.',
      bio: 'Eight years designing B2B products, most recently leading design for the payments platform at Ledgerline. I work closest to engineering: prototyping in code, writing the spec, and staying through launch to read the numbers.',
      email: 'hello@miraokafor.design',
      available: true,
      availText: 'Open to senior roles from January',
    },
    stats: [
      { v: '8 yrs', l: 'Designing products' },
      { v: '40+', l: 'Features shipped' },
      { v: '3', l: 'Design systems built' },
    ],
    projects: [
      { id: uid(), title: 'Ledgerline Payouts', year: '2025', client: 'Ledgerline', tags: ['Fintech', 'Design system', '0 → 1'], summary: 'Rebuilt the payout flow used by 12,000 merchants, from bank linking to reconciliation.', metric: 'Support tickets down 38% in 90 days', url: '', hue: 226, image: '' },
      { id: uid(), title: 'Harbor Field App', year: '2024', client: 'Harbor Logistics', tags: ['Mobile', 'Offline-first'], summary: 'An offline-first scanning app for dock crews handling 4,000 containers a shift.', metric: 'Scan time cut from 9 s to 3 s', url: '', hue: 16, image: '' },
      { id: uid(), title: 'Tessera Design System', year: '2023', client: 'Tessera', tags: ['Systems', 'Accessibility'], summary: '140 components with tokens shared across web, iOS and Android.', metric: 'WCAG 2.2 AA across the library', url: '', hue: 158, image: '' },
      { id: uid(), title: 'Quill Editor', year: '2022', client: 'Quill Labs', tags: ['Editor', 'Research'], summary: 'A drafting tool for legal teams, shaped by 30 interviews with paralegals.', metric: 'Rated 4.8 by early customers', url: '', hue: 284, image: '' },
    ],
    experience: [
      { id: uid(), start: '2023', end: 'Now', role: 'Lead Product Designer', company: 'Ledgerline', note: 'Lead a team of four across payments and onboarding.' },
      { id: uid(), start: '2020', end: '2023', role: 'Senior Product Designer', company: 'Harbor Logistics', note: 'Owned the field app and its component library.' },
      { id: uid(), start: '2017', end: '2020', role: 'Product Designer', company: 'Tessera', note: 'First design hire. Grew the team to six.' },
    ],
    skills: ['Product strategy', 'Interaction design', 'Design systems', 'Prototyping in React', 'Figma', 'User research', 'Accessibility', 'Workshop facilitation'],
    testimonial: {
      quote: 'Mira turns a vague brief into something engineers can build on Monday. Our payouts launch was the calmest release we have had.',
      who: 'Daniel Reyes',
      role: 'VP Engineering, Ledgerline',
    },
    links: [
      { id: uid(), label: 'LinkedIn', url: 'https://www.linkedin.com/' },
      { id: uid(), label: 'Dribbble', url: 'https://dribbble.com/' },
      { id: uid(), label: 'Read.cv', url: 'https://read.cv/' },
    ],
    site: { domain: 'miraokafor.design', title: 'Mira Okafor, Product Designer', desc: '' },
    design: { template: 'editorial', accent: '#2F4BFF', fonts: 'default', radius: 14, density: 'regular', mode: 'light' },
    sections: [
      { k: 'work', title: 'Selected work', on: true },
      { k: 'experience', title: 'Experience', on: true },
      { k: 'skills', title: 'Capabilities', on: true },
      { k: 'testimonial', title: 'Kind words', on: true },
      { k: 'contact', title: "Let's work together", on: true },
    ],
  }
}

export function blankPortfolio(keep: Portfolio): Portfolio {
  return {
    ...samplePortfolio(),
    profile: { name: 'Your Name', role: '', location: '', headline: '', bio: '', email: '', available: false, availText: '' },
    stats: [{ v: '', l: '' }, { v: '', l: '' }, { v: '', l: '' }],
    projects: [],
    experience: [],
    skills: [],
    testimonial: { quote: '', who: '', role: '' },
    links: [],
    site: { domain: 'yourname.com', title: '', desc: '' },
    design: structuredClone(keep.design),
    sections: structuredClone(keep.sections),
  }
}

export const SAMPLE_NAME = 'Mira Okafor'
