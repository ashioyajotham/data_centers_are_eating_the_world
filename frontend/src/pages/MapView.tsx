import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import Map from '@/components/Map'
import FilterPanel from '@/components/FilterPanel'
import DataCenterCard from '@/components/DataCenterCard'
import { useDataCenters } from '@/hooks/useDataCenters'
import { dataCenterApi } from '@/services/api'
import toast from 'react-hot-toast'
import type { FilterOptions, DataCenter } from '@/types'

export default function MapView() {
  const { data: dataCenters, isLoading, error } = useDataCenters()
  const [filters, setFilters] = useState<FilterOptions>({})
  const [selectedDataCenter, setSelectedDataCenter] = useState<DataCenter | null>(null)

  const filteredDataCenters = useMemo(() => {
    if (!dataCenters) return []
    
    return dataCenters.filter(dc => {
      if (filters.status?.length && !filters.status.includes(dc.status)) return false
      if (filters.ownershipType?.length && !filters.ownershipType.includes(dc.ownershipType)) return false
      if (filters.country?.length && !filters.country.includes(dc.country)) return false
      return true
    })
  }, [dataCenters, filters])

  const availableFilters = useMemo(() => {
    if (!dataCenters) return { countries: [], operators: [], statuses: [] }
    
    return {
      countries: [...new Set(dataCenters.map(dc => dc.country))].sort(),
      operators: [...new Set(dataCenters.map(dc => dc.operator))].sort(),
      statuses: [...new Set(dataCenters.map(dc => dc.status))].sort(),
    }
  }, [dataCenters])

  const handleExport = async (format: 'json' | 'csv' | 'geojson') => {
    try {
      const blob = await dataCenterApi.exportData(format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `datacenters.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (err) {
      toast.error('Export failed')
    }
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load data centers</p>
          <p className="text-gray-500 text-sm mt-2">Please try again later</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading data centers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Map Container */}
      <div className="flex-1 relative">
        <Map
          dataCenters={filteredDataCenters}
          selectedId={selectedDataCenter?.id}
          onSelect={setSelectedDataCenter}
        />
        
        <FilterPanel
          onFilterChange={setFilters}
          availableFilters={availableFilters}
        />

        {/* Export Button */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => handleExport('geojson')}
              className="px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 w-full"
            >
              <Download size={18} />
              <span className="font-medium">Export GeoJSON</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 w-full border-t"
            >
              <Download size={18} />
              <span className="font-medium">Export JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 w-full border-t"
            >
              <Download size={18} />
              <span className="font-medium">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="absolute bottom-4 left-4 z-10 bg-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600">
            Showing <span className="font-bold text-gray-900">{filteredDataCenters.length}</span> of{' '}
            <span className="font-bold text-gray-900">{dataCenters?.length || 0}</span> data centers
          </p>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDataCenter && (
        <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto p-6">
          <DataCenterCard
            dataCenter={selectedDataCenter}
            onClick={() => {}}
          />
          
          <div className="mt-6 space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Full Address</h4>
              <p className="text-sm text-gray-600">{selectedDataCenter.address}</p>
            </div>

            {selectedDataCenter.metadata?.certifications && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDataCenter.metadata.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedDataCenter.metadata?.connectivity && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Connectivity</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {selectedDataCenter.metadata.connectivity.map((conn, idx) => (
                    <li key={idx}>{conn}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-2">All Sources</h4>
              <div className="space-y-2">
                {selectedDataCenter.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-primary-600 hover:text-primary-800 hover:underline"
                  >
                    {source.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

