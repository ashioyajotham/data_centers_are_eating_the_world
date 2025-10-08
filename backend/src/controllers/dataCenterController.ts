import { Request, Response } from 'express'
import { DataCenterModel } from '../models/DataCenter'
import { stringify } from 'csv-stringify/sync'

export const getAllDataCenters = async (req: Request, res: Response) => {
  try {
    const dataCenters = await DataCenterModel.findAll()
    res.json(dataCenters)
  } catch (error) {
    console.error('Error fetching data centers:', error)
    res.status(500).json({ error: 'Failed to fetch data centers' })
  }
}

export const getDataCenterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const dataCenter = await DataCenterModel.findById(id)
    
    if (!dataCenter) {
      return res.status(404).json({ error: 'Data center not found' })
    }
    
    res.json(dataCenter)
  } catch (error) {
    console.error('Error fetching data center:', error)
    res.status(500).json({ error: 'Failed to fetch data center' })
  }
}

export const getGeoJSON = async (req: Request, res: Response) => {
  try {
    const dataCenters = await DataCenterModel.findAll()
    
    const geoJSON = {
      type: 'FeatureCollection',
      features: dataCenters.map(dc => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [dc.longitude, dc.latitude],
        },
        properties: dc,
      })),
    }
    
    res.json(geoJSON)
  } catch (error) {
    console.error('Error generating GeoJSON:', error)
    res.status(500).json({ error: 'Failed to generate GeoJSON' })
  }
}

export const exportData = async (req: Request, res: Response) => {
  try {
    const { format } = req.params
    const dataCenters = await DataCenterModel.findAll()

    switch (format) {
      case 'json':
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Content-Disposition', 'attachment; filename=datacenters.json')
        res.json(dataCenters)
        break

      case 'csv':
        const csv = stringify(
          dataCenters.map(dc => ({
            id: dc.id,
            name: dc.name,
            operator: dc.operator,
            city: dc.city,
            country: dc.country,
            latitude: dc.latitude,
            longitude: dc.longitude,
            status: dc.status,
            ownership_type: dc.ownershipType,
            power_capacity_mw: dc.capacity?.power_mw || '',
            year_established: dc.yearEstablished || '',
          })),
          { header: true }
        )
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', 'attachment; filename=datacenters.csv')
        res.send(csv)
        break

      case 'geojson':
        const geoJSON = {
          type: 'FeatureCollection',
          features: dataCenters.map(dc => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [dc.longitude, dc.latitude],
            },
            properties: dc,
          })),
        }
        res.setHeader('Content-Type', 'application/geo+json')
        res.setHeader('Content-Disposition', 'attachment; filename=datacenters.geojson')
        res.json(geoJSON)
        break

      default:
        res.status(400).json({ error: 'Invalid export format' })
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    res.status(500).json({ error: 'Failed to export data' })
  }
}

export const createDataCenter = async (req: Request, res: Response) => {
  try {
    const dataCenter = await DataCenterModel.create(req.body)
    res.status(201).json(dataCenter)
  } catch (error) {
    console.error('Error creating data center:', error)
    res.status(500).json({ error: 'Failed to create data center' })
  }
}

export const updateDataCenter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const dataCenter = await DataCenterModel.update(id, req.body)
    
    if (!dataCenter) {
      return res.status(404).json({ error: 'Data center not found' })
    }
    
    res.json(dataCenter)
  } catch (error) {
    console.error('Error updating data center:', error)
    res.status(500).json({ error: 'Failed to update data center' })
  }
}

export const deleteDataCenter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const deleted = await DataCenterModel.delete(id)
    
    if (!deleted) {
      return res.status(404).json({ error: 'Data center not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Error deleting data center:', error)
    res.status(500).json({ error: 'Failed to delete data center' })
  }
}

