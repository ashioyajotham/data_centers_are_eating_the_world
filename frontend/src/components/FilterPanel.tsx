import { useState } from 'react'
import { X, Filter, SlidersHorizontal } from 'lucide-react'
import type { FilterOptions } from '@/types'

interface FilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void
  availableFilters: {
    countries: string[]
    operators: string[]
    statuses: string[]
  }
}

export default function FilterPanel({ onFilterChange, availableFilters }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    status: [],
    ownershipType: [],
    country: [],
    operator: [],
  })

  const handleFilterChange = (key: keyof FilterOptions, value: string, checked: boolean) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      const array = (newFilters[key] as string[]) || []

      if (checked) {
        newFilters[key] = [...array, value] as any
      } else {
        newFilters[key] = array.filter((v) => v !== value) as any
      }

      onFilterChange(newFilters)
      return newFilters
    })
  }

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      status: [],
      ownershipType: [],
      country: [],
      operator: [],
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-lg shadow-slate-900/10 ring-1 ring-slate-950/5 backdrop-blur-md transition hover:bg-white hover:shadow-xl"
      >
        <SlidersHorizontal size={18} className="text-primary-600" />
        Filters
      </button>
    )
  }

  return (
    <div
      className="absolute left-4 top-4 z-10 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-xl shadow-slate-900/15 ring-1 ring-slate-950/5 backdrop-blur-md"
      role="region"
      aria-label="Map filters"
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/15">
            <Filter size={16} className="text-primary-600" />
          </div>
          <h3 className="text-sm font-semibold tracking-tight text-slate-900">Filters</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Collapse filters"
        >
          <X size={18} />
        </button>
      </div>

      <div className="max-h-[min(65vh,420px)] space-y-4 overflow-y-auto p-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</h4>
          <div className="space-y-2">
            {availableFilters.statuses.map((status) => (
              <label
                key={status}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status) || false}
                  onChange={(e) => handleFilterChange('status', status, e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm capitalize text-slate-700">{status.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ownership</h4>
          <div className="space-y-2">
            {['local', 'foreign', 'joint-venture'].map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={filters.ownershipType?.includes(type) || false}
                  onChange={(e) => handleFilterChange('ownershipType', type, e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm capitalize text-slate-700">{type.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Country</h4>
          <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
            {availableFilters.countries.map((country) => (
              <label
                key={country}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={filters.country?.includes(country) || false}
                  onChange={(e) => handleFilterChange('country', country, e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700">{country}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Clear all
        </button>
      </div>
    </div>
  )
}