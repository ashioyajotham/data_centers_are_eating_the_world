import { useState, useEffect } from 'react'
import axios from 'axios'
import { authApi } from '@/services/api'
import { getAdminToken, setAdminToken } from '@/services/authStorage'

interface ProtectedRouteProps {
  children: React.ReactNode
}

function parseAuthError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data as { error?: string } | undefined
    if (msg?.error) return msg.error
    if (err.response?.status === 401) return 'Invalid credentials'
  }
  return 'Something went wrong. Please try again.'
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = getAdminToken()
    if (!token) {
      setIsAuthenticated(false)
      return
    }

    let cancelled = false
    authApi
      .me()
      .then(() => {
        if (!cancelled) setIsAuthenticated(true)
      })
      .catch(() => {
        if (!cancelled) {
          setAdminToken(null)
          setIsAuthenticated(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const { token } = await authApi.login(password)
      setAdminToken(token)
      setPassword('')
      setIsAuthenticated(true)
    } catch (err) {
      setError(parseAuthError(err))
      setPassword('')
    }
  }

  const handleLogout = () => {
    setAdminToken(null)
    setIsAuthenticated(false)
    setPassword('')
  }

  if (isAuthenticated === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600">Sign in with the server admin password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-400"
                placeholder="Admin password"
                autoFocus
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
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-xs text-gray-500 text-center">
            Password is validated on the server. Set <code className="text-gray-600">ADMIN_PASSWORD</code> and{' '}
            <code className="text-gray-600">JWT_SECRET</code> in backend environment.
          </p>
        </div>
      </div>
    )
  }

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
