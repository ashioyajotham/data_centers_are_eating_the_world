import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/services/api'
import { getAdminToken, setAdminToken } from '@/services/authStorage'
import type { AuthStatus } from '@/types'
import { AdminSessionContext } from '@/contexts/AdminSessionContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const MIN_PASSWORD_LENGTH = 12

function parseAuthError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data as { error?: string } | undefined
    if (msg?.error) return msg.error
    if (err.response?.status === 401) return 'Invalid credentials'
    if (!err.response) return 'Cannot reach the API. Check VITE_API_URL and CORS (FRONTEND_ORIGIN).'
  }
  return 'Something went wrong. Please try again.'
}

type Phase = 'loading' | 'authed' | 'guest'

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [status, setStatus] = useState<AuthStatus | null>(null)
  const [error, setError] = useState('')

  const [loginPassword, setLoginPassword] = useState('')
  const [setupPassword, setSetupPassword] = useState('')
  const [setupPasswordConfirm, setSetupPasswordConfirm] = useState('')
  const [setupToken, setSetupToken] = useState('')

  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)

  const [showLegacyLogin, setShowLegacyLogin] = useState(false)

  const googleBtnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await authApi.status()
        if (cancelled) return
        setStatus(s)
        const t = getAdminToken()
        if (t) {
          try {
            await authApi.me()
            if (!cancelled) setPhase('authed')
            return
          } catch {
            setAdminToken(null)
          }
        }
        if (!cancelled) setPhase('guest')
      } catch {
        if (!cancelled) {
          setStatus({
            jwtConfigured: false,
            needsPasswordSetup: true,
            legacyEnvLoginAvailable: false,
            googleEnabled: false,
            setupRequiresToken: false,
            migrationRequired: false,
          })
          setPhase('guest')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const viteGoogleId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const googleReadyOnClient = Boolean(status?.googleEnabled && viteGoogleId)

  useEffect(() => {
    if (phase !== 'guest' || !googleReadyOnClient || !googleBtnRef.current) return

    const render = () => {
      const el = googleBtnRef.current
      if (!el || !window.google?.accounts?.id) return
      el.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: viteGoogleId!,
        callback: async (resp) => {
          setError('')
          try {
            const { token } = await authApi.loginGoogle(resp.credential)
            setAdminToken(token)
            setPhase('authed')
          } catch (err) {
            setError(parseAuthError(err))
          }
        },
      })
      window.google.accounts.id.renderButton(el, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'continue_with',
      })
    }

    if (window.google?.accounts?.id) {
      render()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-gsi-client="1"]'
    )
    if (existing) {
      existing.addEventListener('load', render, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.dataset.gsiClient = '1'
    script.onload = render
    document.body.appendChild(script)
  }, [phase, googleReadyOnClient, viteGoogleId])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoggingIn(true)
    try {
      const { token } = await authApi.login(loginPassword)
      setAdminToken(token)
      setLoginPassword('')
      setPhase('authed')
    } catch (err) {
      setError(parseAuthError(err))
      setLoginPassword('')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (setupPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters for the password.`)
      return
    }
    if (setupPassword !== setupPasswordConfirm) {
      setError('Passwords do not match.')
      return
    }
    setIsSettingUp(true)
    try {
      const { token } = await authApi.setupPassword({
        password: setupPassword,
        passwordConfirm: setupPasswordConfirm,
        ...(status?.setupRequiresToken ? { setupToken: setupToken || undefined } : {}),
      })
      setAdminToken(token)
      setSetupPassword('')
      setSetupPasswordConfirm('')
      setSetupToken('')
      setPhase('authed')
    } catch (err) {
      setError(parseAuthError(err))
    } finally {
      setIsSettingUp(false)
    }
  }

  const handleLogout = () => {
    setAdminToken(null)
    setPhase('guest')
    setLoginPassword('')
    setError('')
    void authApi.status().then(setStatus)
  }

  if (phase === 'loading' || status === null) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    )
  }

  if (phase === 'authed') {
    return (
      <AdminSessionContext.Provider value={{ logout: handleLogout }}>
        <div className="h-full w-full">{children}</div>
      </AdminSessionContext.Provider>
    )
  }

  const showInitialSetup =
    status.jwtConfigured &&
    status.needsPasswordSetup &&
    !showLegacyLogin &&
    !status.migrationRequired
  const showPasswordLogin =
    status.jwtConfigured &&
    (!status.needsPasswordSetup ||
      (status.legacyEnvLoginAvailable && (showLegacyLogin || Boolean(status.migrationRequired))))

  const authBusy = isLoggingIn || isSettingUp

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto bg-gradient-to-br from-slate-200 via-slate-100 to-primary-50/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-8 shadow-2xl shadow-slate-900/10 ring-1 ring-slate-200/80 backdrop-blur-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500/15 ring-1 ring-primary-500/25">
            <span className="text-xl">🔐</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Admin access</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Sign in with Google (if configured) or your admin password.
          </p>
        </div>

        {status.migrationRequired && (
          <div className="mb-4 rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-900">
            <p className="font-medium">Database migration required</p>
            <p className="mt-2 text-red-800/90">
              Add the <code className="rounded bg-red-100 px-1 text-xs">admin_auth</code> table on your production
              Postgres (see <code className="text-xs">docs/DEPLOYMENT.md</code>).
            </p>
          </div>
        )}

        {!status.jwtConfigured && (
          <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
            Set <code className="rounded bg-amber-100/80 px-1 text-xs">JWT_SECRET</code> on the API server.
          </div>
        )}

        {status.jwtConfigured && showInitialSetup && (
          <div className="mb-8 border-b border-slate-100 pb-8">
            <h3 className="mb-1 text-base font-semibold text-slate-900">Initial setup</h3>
            <p className="mb-4 text-sm text-slate-600">
              Choose a strong password; it is stored as a bcrypt hash in the database.
            </p>
            <form onSubmit={handleSetup} className="space-y-4">
              {status.setupRequiresToken && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="setupToken">
                    Setup token
                  </label>
                  <input
                    id="setupToken"
                    type="password"
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    autoComplete="off"
                  />
                  <p className="mt-1 text-xs text-slate-500">Must match server ADMIN_SETUP_TOKEN.</p>
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="newPass">
                  New password
                </label>
                <input
                  id="newPass"
                  type="password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  disabled={authBusy}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="newPass2">
                  Confirm password
                </label>
                <input
                  id="newPass2"
                  type="password"
                  value={setupPasswordConfirm}
                  onChange={(e) => setSetupPasswordConfirm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                  disabled={authBusy}
                />
              </div>
              <p className="text-xs text-slate-500">Minimum {MIN_PASSWORD_LENGTH} characters.</p>
              <button
                type="submit"
                disabled={authBusy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save password and sign in'
                )}
              </button>
            </form>
            {status.legacyEnvLoginAvailable && (
              <button
                type="button"
                onClick={() => {
                  setShowLegacyLogin(true)
                  setError('')
                }}
                className="mt-4 w-full text-sm font-medium text-primary-600 hover:text-primary-800"
              >
                Use legacy ADMIN_PASSWORD instead
              </button>
            )}
          </div>
        )}

        {status.googleEnabled && !viteGoogleId && (
          <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-sm text-amber-950">
            API has Google enabled, but <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code> is missing — redeploy
            the frontend after adding it.
          </div>
        )}

        {!status.googleEnabled && status.jwtConfigured && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs leading-relaxed text-slate-600">
            <span className="font-medium text-slate-700">Google sign-in off:</span> set{' '}
            <code className="rounded bg-white px-1">GOOGLE_CLIENT_ID</code> and{' '}
            <code className="rounded bg-white px-1">ADMIN_GOOGLE_EMAILS</code> on the API, and{' '}
            <code className="rounded bg-white px-1">VITE_GOOGLE_CLIENT_ID</code> on the frontend build.
 </div>
        )}

        {googleReadyOnClient && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-slate-700">Continue with Google</p>
            <div ref={googleBtnRef} className="flex min-h-[44px] justify-center" />
            <p className="mt-2 text-center text-xs text-slate-500">
              Only emails in <code className="text-slate-600">ADMIN_GOOGLE_EMAILS</code> are allowed.
            </p>
          </div>
        )}

        {status.jwtConfigured && showPasswordLogin && (
          <>
            {googleReadyOnClient && (
              <div className="mb-6 flex items-center gap-3 text-sm text-slate-400">
                <span className="flex-1 border-t border-slate-200" />
                or password
                <span className="flex-1 border-t border-slate-200" />
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={authBusy}
                />
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={authBusy || !loginPassword}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
            {status.needsPasswordSetup && status.legacyEnvLoginAvailable && showLegacyLogin && (
              <button
                type="button"
                onClick={() => {
                  setShowLegacyLogin(false)
                  setError('')
                }}
                className="mt-3 w-full text-sm text-slate-600 hover:text-slate-900"
              >
                Back to initial setup
              </button>
            )}
          </>
        )}

        {error && !(status.jwtConfigured && showPasswordLogin) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
          Sessions use signed JWTs (<code className="text-slate-600">JWT_SECRET</code> on the server). Passwords are
          bcrypt hashes in Postgres.
        </p>
      </div>
    </div>
  )
}
