import { useState } from 'react'
import { X, Filter } from 'lucide-react'
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
    setFilters(prev => {
      const newFilters = { ...prev }
      const array = (newFilters[key] as string[]) || []
      
      if (checked) {
        newFilters[key] = [...array, value] as any
      } else {
        newFilters[key] = array.filter(v => v !== value) as any
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
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
      >
        <Filter size={18} />
        <span className="font-medium">Filters</span>
      </button>
    )
  }

  return (
    <div className="absolute top-4 left-4 z-10 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={18} />
          <h3 className="font-bold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto space-y-4">
        {/* Status Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Status</h4>
          <div className="space-y-2">
            {availableFilters.statuses.map(status => (
              <label key={status} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status?.includes(status) || false}
                  onChange={e => handleFilterChange('status', status, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {status.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Ownership Type Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Ownership</h4>
          <div className="space-y-2">
            {['local', 'foreign', 'joint-venture'].map(type => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.ownershipType?.includes(type) || false}
                  onChange={e => handleFilterChange('ownershipType', type, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {type.replace('-', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Country Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Country</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableFilters.countries.map(country => (
              <label key={country} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.country?.includes(country) || false}
                  onChange={e => handleFilterChange('country', country, e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{country}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )
}

