import { Outlet, Link, useLocation } from 'react-router-dom'
import { Map, BarChart3, Database, Info, Shield } from 'lucide-react'
import clsx from 'clsx'

export default function Layout() {
  const location = useLocation()

  const navigation = [
    { name: 'Map', href: '/', icon: Map },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Explorer', href: '/explorer', icon: Database },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Admin', href: '/admin', icon: Shield },
  ]

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800/50 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-200 shadow-xl">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/20 text-lg ring-1 ring-primary-400/30">
              🌍
            </span>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white">Data Centers</h1>
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Infrastructure map
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-500/15 text-primary-300 shadow-inner ring-1 ring-primary-500/25'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon size={18} className={isActive ? 'text-primary-400' : 'opacity-80'} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Open source</p>
          <p className="mt-1 text-xs text-slate-400">MIT · CC BY 4.0 data</p>
          <p className="mt-2 text-[10px] text-slate-500">v0.1 Alpha</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
