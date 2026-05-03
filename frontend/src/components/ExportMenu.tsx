import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'

type ExportFormat = 'json' | 'csv' | 'geojson'

export function ExportMenu({
  onExport,
  disabled,
}: {
  onExport: (format: ExportFormat) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const items: { format: ExportFormat; label: string }[] = [
    { format: 'geojson', label: 'GeoJSON' },
    { format: 'json', label: 'JSON' },
    { format: 'csv', label: 'CSV' },
  ]

  return (
    <div ref={ref} className="absolute right-4 top-4 z-10">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg shadow-slate-900/10 ring-1 ring-slate-950/5 backdrop-blur-md transition hover:bg-white hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Download className="h-4 w-4 text-primary-600" aria-hidden />
        Export
        <ChevronDown className={`h-4 w-4 opacity-60 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          className="absolute right-0 mt-2 min-w-[11rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white py-1 shadow-xl ring-1 ring-slate-950/5"
          role="listbox"
        >
          {items.map(({ format, label }) => (
            <li key={format}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-primary-50 hover:text-primary-800"
                onClick={() => {
                  onExport(format)
                  setOpen(false)
                }}
              >
                <Download className="h-3.5 w-3.5 opacity-50" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
