import { useEffect, useRef, useState } from 'react'
import MapGL, { Marker, Popup, NavigationControl, ScaleControl } from 'react-map-gl'
import { Server } from 'lucide-react'
import type { DataCenter } from '@/types'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

interface MapProps {
  dataCenters: DataCenter[]
  selectedId?: string | null
  onSelect?: (dataCenter: DataCenter | null) => void
}

export default function Map({ dataCenters, selectedId, onSelect }: MapProps) {
  const mapRef = useRef(null)
  const [viewState, setViewState] = useState({
    latitude: -1.2921, // Nairobi, Kenya
    longitude: 36.8219,
    zoom: 6,
  })
  const [popupInfo, setPopupInfo] = useState<DataCenter | null>(null)

  // Center map on Kenya/East Africa initially
  useEffect(() => {
    if (dataCenters.length > 0 && mapRef.current) {
      // Calculate bounds of all data centers
      const lats = dataCenters.map(dc => dc.latitude)
      const lngs = dataCenters.map(dc => dc.longitude)
      
      if (lats.length > 0 && lngs.length > 0) {
        const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length
        const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length
        
        setViewState(prev => ({
          ...prev,
          latitude: avgLat,
          longitude: avgLng,
        }))
      }
    }
  }, [dataCenters])

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-500'
      case 'under-construction':
        return 'text-yellow-500'
      case 'planned':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="w-full h-full">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Data Center Markers */}
        {dataCenters.map((dc) => (
          <Marker
            key={dc.id}
            latitude={dc.latitude}
            longitude={dc.longitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation()
              setPopupInfo(dc)
              onSelect?.(dc)
            }}
          >
            <div
              className={`cursor-pointer transition-transform hover:scale-110 ${
                selectedId === dc.id ? 'scale-125' : ''
              }`}
            >
              <Server
                size={selectedId === dc.id ? 32 : 24}
                className={getMarkerColor(dc.status)}
                strokeWidth={2}
              />
            </div>
          </Marker>
        ))}

        {/* Popup */}
        {popupInfo && (
          <Popup
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            anchor="top"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
          >
            <div className="p-4 min-w-[250px]">
              <h3 className="font-bold text-gray-900 mb-2">
                {popupInfo.name}
              </h3>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Operator:</span> {popupInfo.operator}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className="capitalize">{popupInfo.status.replace('-', ' ')}</span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Location:</span> {popupInfo.city}, {popupInfo.country}
                </p>
                {popupInfo.capacity?.power_mw && (
                  <p className="text-gray-600">
                    <span className="font-medium">Capacity:</span> {popupInfo.capacity.power_mw} MW
                  </p>
                )}
              </div>
            </div>
          </Popup>
        )}
      </MapGL>
    </div>
  )
}

