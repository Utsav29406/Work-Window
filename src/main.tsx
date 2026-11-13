import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import { Toaster } from '@/components/ui/Toast'
import { initAuth } from '@/lib/auth'
import './index.css'

const Landing = lazy(() => import('@/pages/Landing'))
const Builder = lazy(() => import('@/pages/Builder'))
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const PublicSite = lazy(() => import('@/pages/PublicSite'))

initAuth()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense fallback={<div className="h-dvh bg-cream" />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/:slug" element={<PublicSite />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
