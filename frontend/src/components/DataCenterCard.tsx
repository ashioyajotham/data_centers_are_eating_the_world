import { Building2, MapPin, Zap, Calendar, ExternalLink } from 'lucide-react'
import type { DataCenter } from '@/types'

interface DataCenterCardProps {
  dataCenter: DataCenter
  onClick?: () => void
}

export default function DataCenterCard({ dataCenter, onClick }: DataCenterCardProps) {
  const statusColors = {
    operational: 'bg-green-100 text-green-800',
    'under-construction': 'bg-yellow-100 text-yellow-800',
    planned: 'bg-blue-100 text-blue-800',
    decommissioned: 'bg-gray-100 text-gray-800',
  }

  const ownershipColors = {
    local: 'bg-purple-100 text-purple-800',
    foreign: 'bg-orange-100 text-orange-800',
    'joint-venture': 'bg-teal-100 text-teal-800',
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {dataCenter.name}
          </h3>
          <p className="text-sm text-gray-600">{dataCenter.operator}</p>
        </div>
        <Building2 size={24} className="text-primary-500" />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span>{dataCenter.city}, {dataCenter.country}</span>
        </div>

        {dataCenter.capacity?.power_mw && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap size={16} />
            <span>{dataCenter.capacity.power_mw} MW capacity</span>
          </div>
        )}

        {dataCenter.yearEstablished && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>Established {dataCenter.yearEstablished}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusColors[dataCenter.status]
          }`}
        >
          {dataCenter.status.replace('-', ' ')}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            ownershipColors[dataCenter.ownershipType]
          }`}
        >
          {dataCenter.ownershipType.replace('-', ' ')}
        </span>
      </div>

      {dataCenter.sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Sources:</p>
          <div className="flex gap-2">
            {dataCenter.sources.slice(0, 2).map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                onClick={e => e.stopPropagation()}
              >
                {source.name}
                <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

