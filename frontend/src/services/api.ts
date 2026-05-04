import axios from 'axios'
import type {
  DataCenter,
  GeoJSONFeatureCollection,
  Statistics,
  AuthStatus,
  IngestionCandidate,
  IngestionCandidateStatus,
} from '@/types'
import { getAdminToken } from './authStorage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authApi = {
  status: async (): Promise<AuthStatus> => {
    const { data } = await api.get<AuthStatus>('/auth/status')
    return data
  },

  setupPassword: async (body: {
    password: string
    passwordConfirm: string
    setupToken?: string
  }): Promise<{ token: string }> => {
    const { data } = await api.post<{ token: string }>('/auth/setup-password', body)
    return data
  },

  login: async (password: string): Promise<{ token: string }> => {
    const { data } = await api.post<{ token: string }>('/auth/login', { password })
    return data
  },

  loginGoogle: async (credential: string): Promise<{ token: string }> => {
    const { data } = await api.post<{ token: string }>('/auth/google', { credential })
    return data
  },

  me: async (): Promise<{ ok: boolean }> => {
    const { data } = await api.get<{ ok: boolean }>('/auth/me')
    return data
  },
}

export const dataCenterApi = {
  getAll: async (): Promise<DataCenter[]> => {
    const { data } = await api.get<DataCenter[]>('/datacenters')
    return data
  },

  getGeoJSON: async (): Promise<GeoJSONFeatureCollection> => {
    const { data } = await api.get<GeoJSONFeatureCollection>('/datacenters/geojson')
    return data
  },

  getById: async (id: string): Promise<DataCenter> => {
    const { data } = await api.get<DataCenter>(`/datacenters/${id}`)
    return data
  },

  getStatistics: async (): Promise<Statistics> => {
    const { data } = await api.get<Statistics>('/statistics')
    return data
  },

  exportData: async (format: 'json' | 'csv' | 'geojson'): Promise<Blob> => {
    const { data } = await api.get(`/datacenters/export/${format}`, {
      responseType: 'blob',
    })
    return data
  },

  verifySources: async (id: string): Promise<DataCenter> => {
    const { data } = await api.patch<DataCenter>(`/datacenters/${id}/sources/verify`)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/datacenters/${id}`)
  },
}

export const ingestionApi = {
  listCandidates: async (status: IngestionCandidateStatus = 'pending'): Promise<IngestionCandidate[]> => {
    const { data } = await api.get<IngestionCandidate[]>(`/ingestion/candidates`, {
      params: { status },
    })
    return data
  },

  approveCandidate: async (
    id: string,
    body?: { note?: string }
  ): Promise<{ candidate: IngestionCandidate; dataCenter: DataCenter }> => {
    const { data } = await api.patch(`/ingestion/candidates/${id}/approve`, body ?? {})
    return data
  },

  rejectCandidate: async (id: string, body?: { note?: string }): Promise<IngestionCandidate> => {
    const { data } = await api.patch(`/ingestion/candidates/${id}/reject`, body ?? {})
    return data
  },

  markDuplicate: async (
    id: string,
    body: { existingDataCenterId: string; note?: string }
  ): Promise<IngestionCandidate> => {
    const { data } = await api.patch(`/ingestion/candidates/${id}/duplicate`, body)
    return data
  },
}

export default api
