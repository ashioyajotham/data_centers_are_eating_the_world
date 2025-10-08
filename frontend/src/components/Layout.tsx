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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            Data Centers 🌍
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mapping Digital Infrastructure
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Open Source</p>
            <p>MIT License | CC BY 4.0 Data</p>
            <p className="mt-2">Version 0.1 - Alpha</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
