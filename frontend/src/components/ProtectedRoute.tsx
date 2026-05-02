import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { authApi } from '@/services/api'
import { getAdminToken, setAdminToken } from '@/services/authStorage'
import type { AuthStatus } from '@/types'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const MIN_PASSWORD_LENGTH = 12

function parseAuthError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data as { error?: string } | undefined
    if (msg?.error) return msg.error
    if (err.response?.status === 401) return 'Invalid credentials'
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

  /** When DB password not set but legacy ADMIN_PASSWORD exists, allow sign-in without completing setup. */
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
    try {
      const { token } = await authApi.login(loginPassword)
      setAdminToken(token)
      setLoginPassword('')
      setPhase('authed')
    } catch (err) {
      setError(parseAuthError(err))
      setLoginPassword('')
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
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (phase === 'authed') {
    return (
      <div className="h-full w-full relative">
        <div className="h-full w-full">{children}</div>
        <button
          type="button"
          onClick={handleLogout}
          className="fixed top-20 right-8 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
        >
          Logout Admin
        </button>
      </div>
    )
  }

  const showInitialSetup =
    status.jwtConfigured && status.needsPasswordSetup && !showLegacyLogin
  const showPasswordLogin =
    status.jwtConfigured &&
    (!status.needsPasswordSetup || (status.legacyEnvLoginAvailable && showLegacyLogin))

  return (
    <div className="h-full flex items-center justify-center bg-gray-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-600 text-sm">
            Sign in with Google (if configured), or your admin password stored securely on the server.
          </p>
        </div>

        {!status.jwtConfigured && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 text-sm">
            Set <code className="text-xs">JWT_SECRET</code> on the API server before admin sign-in works.
          </div>
        )}

        {status.jwtConfigured && showInitialSetup && (
          <div className="mb-8 border-b border-gray-100 pb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Initial setup</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create the admin password (bcrypt hash in the database). You will be signed in automatically.
            </p>
            <form onSubmit={handleSetup} className="space-y-4">
              {status.setupRequiresToken && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="setupToken">
                    Setup token
                  </label>
                  <input
                    id="setupToken"
                    type="password"
                    value={setupToken}
                    onChange={(e) => setSetupToken(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                    autoComplete="off"
                  />
                  <p className="text-xs text-gray-500 mt-1">Value must match server ADMIN_SETUP_TOKEN.</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPass">
                  New password
                </label>
                <input
                  id="newPass"
                  type="password"
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPass2">
                  Confirm password
                </label>
                <input
                  id="newPass2"
                  type="password"
                  value={setupPasswordConfirm}
                  onChange={(e) => setSetupPasswordConfirm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                />
              </div>
              <p className="text-xs text-gray-500">Minimum length {MIN_PASSWORD_LENGTH} characters.</p>
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Save password and sign in
              </button>
            </form>
            {status.legacyEnvLoginAvailable && (
              <button
                type="button"
                onClick={() => {
                  setShowLegacyLogin(true)
                  setError('')
                }}
                className="mt-4 w-full text-sm text-primary-600 hover:text-primary-800"
              >
                Use legacy server password (ADMIN_PASSWORD) instead
              </button>
            )}
          </div>
        )}

        {status.googleEnabled && !viteGoogleId && (
          <div className="mb-4 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Google sign-in is enabled on the API, but <code className="text-xs">VITE_GOOGLE_CLIENT_ID</code>{' '}
            is missing on the frontend build.
          </div>
        )}

        {googleReadyOnClient && (
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Continue with Google</p>
            <div ref={googleBtnRef} className="flex justify-center min-h-[44px]" />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Only addresses listed in <code className="text-gray-600">ADMIN_GOOGLE_EMAILS</code> on the server
              are allowed.
            </p>
          </div>
        )}

        {status.jwtConfigured && showPasswordLogin && (
          <>
            {googleReadyOnClient && (
              <div className="flex items-center gap-3 mb-6 text-gray-400 text-sm">
                <span className="flex-1 border-t border-gray-200" />
                or password
                <span className="flex-1 border-t border-gray-200" />
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Admin password"
                  autoComplete="current-password"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg"
              >
                Sign in
              </button>
            </form>
            {status.needsPasswordSetup && status.legacyEnvLoginAvailable && showLegacyLogin && (
              <button
                type="button"
                onClick={() => {
                  setShowLegacyLogin(false)
                  setError('')
                }}
                className="mt-3 w-full text-sm text-gray-600 hover:text-gray-800"
              >
                Back to initial setup
              </button>
            )}
          </>
        )}

        {error && !(status.jwtConfigured && showPasswordLogin) && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500 text-center leading-relaxed">
          Passwords are stored as bcrypt hashes in Postgres. <code className="text-gray-600">JWT_SECRET</code>{' '}
          stays on the server for signing sessions. Optional Google sign-in uses Google&apos;s ID token, verified
          on the API.
        </p>
      </div>
    </div>
  )
}
