import { useState, useMemo } from 'react'
import Map from '@/components/Map'
import FilterPanel from '@/components/FilterPanel'
import { ExportMenu } from '@/components/ExportMenu'
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

        <ExportMenu onExport={handleExport} disabled={!dataCenters?.length} />

        <div className="absolute bottom-4 left-4 z-10 rounded-2xl border border-slate-200/90 bg-white/95 px-4 py-2.5 shadow-lg shadow-slate-900/10 ring-1 ring-slate-950/5 backdrop-blur-md">
          <p className="text-sm text-slate-600">
            Showing{' '}
            <span className="font-semibold tabular-nums text-slate-900">{filteredDataCenters.length}</span> of{' '}
            <span className="font-semibold tabular-nums text-slate-900">{dataCenters?.length || 0}</span> centers
          </p>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDataCenter && (
        <div className="w-full max-w-md shrink-0 overflow-y-auto border-l border-slate-200/90 bg-white/98 p-6 shadow-[inset_12px_0_24px_-12px_rgba(15,23,42,0.06)] lg:max-w-[26rem]">
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

