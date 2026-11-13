import { useEffect } from 'react'
import { Opening } from '@/components/landing/Opening'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Marquee } from '@/components/landing/Marquee'
import { TemplateShowcase } from '@/components/landing/TemplateShowcase'
import { Features } from '@/components/landing/Features'
import { CTA, FAQ, Footer, Pricing, Steps } from '@/components/landing/Sections'

export default function Landing() {
  useEffect(() => {
    document.title = 'WorkWindow · Portfolio builder'
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Opening />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <TemplateShowcase />
        <Features />
        <Steps />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
