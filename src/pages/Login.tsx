import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { authMessage, resetPassword, signInEmail, signUpEmail, useAuth } from '@/lib/auth'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { FieldShell, inputClass } from '@/components/ui/Field'
import { toast } from '@/components/ui/Toast'

type Mode = 'signin' | 'signup' | 'reset'

/** Only allow in-app paths as redirect targets. */
const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard')

export default function Login() {
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const navigate = useNavigate()
  const { user, ready } = useAuth()
  const [mode, setMode] = useState<Mode>(params.get('mode') === 'signup' ? 'signup' : 'signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState<'email' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Sign in · WorkWindow'
  }, [])

  // Already signed in (or just finished signing in): continue.
  useEffect(() => {
    if (ready && user) navigate(next, { replace: true })
  }, [ready, user, next, navigate])

  const fail = (e: unknown) => setError(authMessage(e))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setBusy('email')
    try {
      if (mode === 'signin') await signInEmail(email, password)
      else if (mode === 'signup') await signUpEmail(name, email, password)
      else {
        await resetPassword(email)
        toast('Check your inbox for a reset link')
        setMode('signin')
      }
    } catch (err) {
      fail(err)
    } finally {
      setBusy(null)
    }
  }

  const title = mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back'
  const sub =
    mode === 'signup'
      ? 'Save your portfolios, publish them to a live link and get messages from visitors.'
      : mode === 'reset'
        ? 'Enter your email and we will send you a link to choose a new password.'
        : 'Sign in to edit and publish your portfolios.'

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-cream px-4 py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-gold-300/40 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-15%] h-[420px] w-[420px] rounded-full bg-brand-100/60 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[420px]"
      >
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
            <ArrowLeft size={15} /> Home
          </Link>
        </div>

        <div className="rounded-3xl bg-paper p-7 shadow-lift ring-1 ring-black/5 sm:p-8">
          <h1 className="font-display text-[28px] font-semibold leading-tight">{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{sub}</p>


          <form onSubmit={submit} className="mt-6 flex flex-col gap-3.5">
            {mode === 'signup' && (
              <FieldShell label="Your name" htmlFor="ww-name">
                <input id="ww-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Mira Okafor" />
              </FieldShell>
            )}
            <FieldShell label="Email" htmlFor="ww-email">
              <input id="ww-email" type="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
            </FieldShell>
            {mode !== 'reset' && (
              <FieldShell
                label="Password"
                htmlFor="ww-pass"
                hint={mode === 'signup' ? 'At least 6 characters.' : undefined}
              >
                <input
                  id="ww-pass"
                  type="password"
                  required
                  minLength={6}
                  className={inputClass}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </FieldShell>
            )}

            {error && (
              <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-[13px] text-red-800 ring-1 ring-red-200">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy !== null}>
              {busy === 'email' ? <Loader2 size={17} className="animate-spin" /> : mode === 'reset' ? <Mail size={16} /> : null}
              {mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-[13px]">
            {mode === 'signin' && (
              <>
                <button className="font-medium text-muted hover:text-ink" onClick={() => { setError(null); setMode('reset') }}>
                  Forgot password?
                </button>
                <span className="text-muted">
                  New here?{' '}
                  <button className="font-semibold text-brand-600 hover:underline" onClick={() => { setError(null); setMode('signup') }}>
                    Create an account
                  </button>
                </span>
              </>
            )}
            {mode !== 'signin' && (
              <span className="text-muted">
                {mode === 'signup' ? 'Already have an account?' : 'Remembered it?'}{' '}
                <button className="font-semibold text-brand-600 hover:underline" onClick={() => { setError(null); setMode('signin') }}>
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-faint">
          You can keep editing without an account. Anything you made in this browser moves into your account when you sign in.
        </p>
      </motion.div>
    </div>
  )
}
