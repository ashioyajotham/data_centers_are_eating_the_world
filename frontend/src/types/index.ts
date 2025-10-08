export interface DataCenter {
  id: string
  name: string
  operator: string
  address: string
  city: string
  country: string
  latitude: number
  longitude: number
  status: 'operational' | 'planned' | 'under-construction' | 'decommissioned'
  ownershipType: 'local' | 'foreign' | 'joint-venture'
  capacity?: {
    power_mw?: number
    floor_space_sqm?: number
    racks?: number
  }
  yearEstablished?: number
  lastUpdated: string
  sources: Source[]
  metadata?: {
    tier?: string
    certifications?: string[]
    connectivity?: string[]
  }
}

export interface Source {
  url: string
  name: string
  scrapedAt: string
  verified: boolean
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: DataCenter
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface FilterOptions {
  status?: string[]
  ownershipType?: string[]
  country?: string[]
  operator?: string[]
  yearRange?: [number, number]
}

export interface Statistics {
  totalDataCenters: number
  byStatus: Record<string, number>
  byOwnership: Record<string, number>
  byCountry: Record<string, number>
  totalCapacityMW: number
  averageCapacity: number
  growthByYear: Array<{
    year: number
    count: number
  }>
}

export interface MapViewport {
  latitude: number
  longitude: number
  zoom: number
  bearing?: number
  pitch?: number
}

