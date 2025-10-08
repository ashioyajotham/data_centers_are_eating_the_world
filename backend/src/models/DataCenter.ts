import { query } from '../db/connection'

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

export class DataCenterModel {
  static async findAll(): Promise<DataCenter[]> {
    const result = await query(`
      SELECT 
        dc.*,
        COALESCE(
          json_agg(
            json_build_object(
              'url', s.url,
              'name', s.name,
              'scrapedAt', s.scraped_at,
              'verified', s.verified
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as sources
      FROM data_centers dc
      LEFT JOIN sources s ON dc.id = s.data_center_id
      GROUP BY dc.id
      ORDER BY dc.name
    `)

    return result.rows.map(this.mapRow)
  }

  static async findById(id: string): Promise<DataCenter | null> {
    const result = await query(`
      SELECT 
        dc.*,
        COALESCE(
          json_agg(
            json_build_object(
              'url', s.url,
              'name', s.name,
              'scrapedAt', s.scraped_at,
              'verified', s.verified
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as sources
      FROM data_centers dc
      LEFT JOIN sources s ON dc.id = s.data_center_id
      WHERE dc.id = $1
      GROUP BY dc.id
    `, [id])

    if (result.rows.length === 0) return null
    return this.mapRow(result.rows[0])
  }

  static async create(data: Omit<DataCenter, 'id' | 'lastUpdated'>): Promise<DataCenter> {
    const result = await query(`
      INSERT INTO data_centers (
        name, operator, address, city, country,
        latitude, longitude, location,
        status, ownership_type,
        power_capacity_mw, floor_space_sqm, rack_count,
        year_established, tier_rating, certifications, connectivity
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, ST_SetSRID(ST_MakePoint($7, $6), 4326),
        $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16
      )
      RETURNING *
    `, [
      data.name,
      data.operator,
      data.address,
      data.city,
      data.country,
      data.latitude,
      data.longitude,
      data.status,
      data.ownershipType,
      data.capacity?.power_mw,
      data.capacity?.floor_space_sqm,
      data.capacity?.racks,
      data.yearEstablished,
      data.metadata?.tier,
      data.metadata?.certifications,
      data.metadata?.connectivity,
    ])

    return this.findById(result.rows[0].id) as Promise<DataCenter>
  }

  static async update(id: string, data: Partial<DataCenter>): Promise<DataCenter | null> {
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      values.push(data.name)
    }
    if (data.operator !== undefined) {
      updates.push(`operator = $${paramCount++}`)
      values.push(data.operator)
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`)
      values.push(data.status)
    }
    // Add more fields as needed

    if (updates.length === 0) return this.findById(id)

    values.push(id)
    await query(`
      UPDATE data_centers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values)

    return this.findById(id)
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM data_centers WHERE id = $1', [id])
    return (result.rowCount || 0) > 0
  }

  private static mapRow(row: any): DataCenter {
    return {
      id: row.id,
      name: row.name,
      operator: row.operator,
      address: row.address,
      city: row.city,
      country: row.country,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      status: row.status,
      ownershipType: row.ownership_type,
      capacity: {
        power_mw: row.power_capacity_mw ? parseFloat(row.power_capacity_mw) : undefined,
        floor_space_sqm: row.floor_space_sqm ? parseFloat(row.floor_space_sqm) : undefined,
        racks: row.rack_count,
      },
      yearEstablished: row.year_established,
      lastUpdated: row.updated_at,
      sources: row.sources || [],
      metadata: {
        tier: row.tier_rating,
        certifications: row.certifications,
        connectivity: row.connectivity,
      },
    }
  }
}

