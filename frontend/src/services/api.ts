import axios from 'axios'
import type { DataCenter, GeoJSONFeatureCollection, Statistics } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const dataCenterApi = {
  // Get all data centers
  getAll: async (): Promise<DataCenter[]> => {
    const { data } = await api.get('/datacenters')
    return data
  },

  // Get data centers as GeoJSON
  getGeoJSON: async (): Promise<GeoJSONFeatureCollection> => {
    const { data } = await api.get('/datacenters/geojson')
    return data
  },

  // Get single data center by ID
  getById: async (id: string): Promise<DataCenter> => {
    const { data } = await api.get(`/datacenters/${id}`)
    return data
  },

  // Get statistics
  getStatistics: async (): Promise<Statistics> => {
    const { data } = await api.get('/statistics')
    return data
  },

  // Filter data centers
  filter: async (filters: Record<string, any>): Promise<DataCenter[]> => {
    const { data } = await api.get('/datacenters/filter', { params: filters })
    return data
  },

  // Export data
  exportData: async (format: 'json' | 'csv' | 'geojson'): Promise<Blob> => {
    const { data } = await api.get(`/datacenters/export/${format}`, {
      responseType: 'blob',
    })
    return data
  },
}

export default api

