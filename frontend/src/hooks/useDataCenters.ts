import { useQuery } from '@tanstack/react-query'
import { dataCenterApi } from '@/services/api'

export function useDataCenters() {
  return useQuery({
    queryKey: ['datacenters'],
    queryFn: dataCenterApi.getAll,
  })
}

export function useDataCentersGeoJSON() {
  return useQuery({
    queryKey: ['datacenters', 'geojson'],
    queryFn: dataCenterApi.getGeoJSON,
  })
}

export function useDataCenter(id: string) {
  return useQuery({
    queryKey: ['datacenters', id],
    queryFn: () => dataCenterApi.getById(id),
    enabled: !!id,
  })
}

export function useStatistics() {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: dataCenterApi.getStatistics,
  })
}

