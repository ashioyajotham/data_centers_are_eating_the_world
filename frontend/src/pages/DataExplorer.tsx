import { useState } from 'react'
import { Search, SortAsc, SortDesc } from 'lucide-react'
import DataCenterCard from '@/components/DataCenterCard'
import { useDataCenters } from '@/hooks/useDataCenters'
import type { DataCenter } from '@/types'

type SortField = 'name' | 'operator' | 'city' | 'yearEstablished' | 'capacity'
type SortDirection = 'asc' | 'desc'

export default function DataExplorer() {
  const { data: dataCenters, isLoading } = useDataCenters()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const filteredAndSortedData = dataCenters
    ?.filter(dc => {
      const query = searchQuery.toLowerCase()
      return (
        dc.name.toLowerCase().includes(query) ||
        dc.operator.toLowerCase().includes(query) ||
        dc.city.toLowerCase().includes(query) ||
        dc.country.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]

      if (sortField === 'capacity') {
        aVal = a.capacity?.power_mw || 0
        bVal = b.capacity?.power_mw || 0
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal?.toLowerCase() || ''
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Explorer</h1>
          <p className="text-gray-600">Browse and search all data centers</p>
        </div>

        {/* Search and Sort Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, operator, city, or country..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={sortField}
                onChange={e => setSortField(e.target.value as SortField)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="operator">Operator</option>
                <option value="city">City</option>
                <option value="yearEstablished">Year</option>
                <option value="capacity">Capacity</option>
              </select>

              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {sortDirection === 'asc' ? <SortAsc size={20} /> : <SortDesc size={20} />}
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Showing {filteredAndSortedData?.length || 0} of {dataCenters?.length || 0} data centers
          </p>
        </div>

        {/* Data Center Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedData?.map(dc => (
            <DataCenterCard key={dc.id} dataCenter={dc} />
          ))}
        </div>

        {filteredAndSortedData?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No data centers found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

