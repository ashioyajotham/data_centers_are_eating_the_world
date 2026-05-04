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
  /** When false, hidden from map/exports for anonymous API consumers. Admins see all. */
  verified?: boolean
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

  /** Published facilities only (map, public API, exports for anonymous users). */
  static async findAllPublished(): Promise<DataCenter[]> {
    const result = await query(
      `
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
      WHERE dc.verified IS NOT FALSE
      GROUP BY dc.id
      ORDER BY dc.name
    `
    )

    return result.rows.map(this.mapRow)
  }

  static async findById(id: string, opts?: { includeUnpublished?: boolean }): Promise<DataCenter | null> {
    const result = await query(
      `
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
    `,
      [id]
    )

    if (result.rows.length === 0) return null
    const row = result.rows[0]
    if (!opts?.includeUnpublished && row.verified === false) return null
    return this.mapRow(row)
  }

  static async create(data: Omit<DataCenter, 'id' | 'lastUpdated'>): Promise<DataCenter> {
    const result = await query(
      `
      INSERT INTO data_centers (
        name, operator, address, city, country,
        latitude, longitude,
        status, ownership_type,
        power_capacity_mw, floor_space_sqm, rack_count,
        year_established, tier_rating, certifications, connectivity,
        verified
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7,
        $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16,
        COALESCE($17, true)
      )
      RETURNING *
    `,
      [
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
        data.verified ?? true,
      ]
    )

    return this.findById(result.rows[0].id, { includeUnpublished: true }) as Promise<DataCenter>
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

    if (updates.length === 0) return this.findById(id, { includeUnpublished: true })

    values.push(id)
    await query(`
      UPDATE data_centers
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
    `, values)

    return this.findById(id, { includeUnpublished: true })
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM data_centers WHERE id = $1', [id])
    return (result.rowCount || 0) > 0
  }

  /** Mark all sources for a data center as verified (admin review). */
  static async verifyAllSources(id: string): Promise<DataCenter | null> {
    const existing = await this.findById(id, { includeUnpublished: true })
    if (!existing) return null

    await query(
      `UPDATE sources SET verified = true WHERE data_center_id = $1`,
      [id]
    )
    return this.findById(id, { includeUnpublished: true })
  }

  /**
   * Upsert from harvester / candidate payload (snake_case keys as produced by Python pipeline).
   * Sets facility and sources as admin-verified / published.
   */
  static async upsertFromIngestionPayload(payload: Record<string, unknown>): Promise<DataCenter> {
    const name = String(payload.name || '').trim()
    const city = String(payload.city || '').trim()
    if (!name || !city) {
      throw new Error('Candidate payload must include name and city')
    }

    const operator = String(payload.operator || '').trim() || 'Unknown'
    const address = String(payload.address || '').trim() || city
    const country = String(payload.country || 'Kenya').trim()
    const latitude = Number(payload.latitude)
    const longitude = Number(payload.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error('Candidate payload must include numeric latitude and longitude')
    }

    const status = payload.status as DataCenter['status']
    if (
      !['operational', 'planned', 'under-construction', 'decommissioned'].includes(
        String(status)
      )
    ) {
      throw new Error('Invalid status in candidate payload')
    }

    const ownershipType = payload.ownership_type as DataCenter['ownershipType']
    if (!['local', 'foreign', 'joint-venture'].includes(String(ownershipType))) {
      throw new Error('Invalid ownership_type in candidate payload')
    }

    const capacity = (payload.capacity || {}) as Record<string, unknown>
    const powerMw = capacity.power_mw != null ? Number(capacity.power_mw) : null
    const floorSqm = capacity.floor_space_sqm != null ? Number(capacity.floor_space_sqm) : null
    const racks = capacity.racks != null ? Number(capacity.racks) : null

    const metadata = (payload.metadata || {}) as Record<string, unknown>
    const yearEstablished =
      payload.year_established != null && payload.year_established !== ''
        ? Number(payload.year_established)
        : null

    const existing = await query(
      `
      SELECT id FROM data_centers
      WHERE LOWER(name) = LOWER($1) AND LOWER(city) = LOWER($2)
    `,
      [name, city]
    )

    let dcId: string

    if (existing.rows.length > 0) {
      dcId = existing.rows[0].id
      await query(
        `
        UPDATE data_centers SET
          operator = $2,
          address = $3,
          country = $4,
          latitude = $5,
          longitude = $6,
          status = $7,
          ownership_type = $8,
          power_capacity_mw = $9,
          floor_space_sqm = $10,
          rack_count = $11,
          year_established = $12,
          tier_rating = $13,
          verified = true,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
        [
          dcId,
          operator,
          address,
          country,
          latitude,
          longitude,
          status,
          ownershipType,
          Number.isFinite(powerMw) ? powerMw : null,
          Number.isFinite(floorSqm) ? floorSqm : null,
          Number.isFinite(racks) ? racks : null,
          Number.isFinite(yearEstablished as number) ? yearEstablished : null,
          metadata.tier != null ? String(metadata.tier) : null,
        ]
      )
    } else {
      const ins = await query(
        `
        INSERT INTO data_centers (
          name, operator, address, city, country,
          latitude, longitude,
          status, ownership_type,
          power_capacity_mw, floor_space_sqm, rack_count,
          year_established, tier_rating,
          verified
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7,
          $8, $9,
          $10, $11, $12,
          $13, $14,
          true
        )
        RETURNING id
      `,
        [
          name,
          operator,
          address,
          city,
          country,
          latitude,
          longitude,
          status,
          ownershipType,
          Number.isFinite(powerMw) ? powerMw : null,
          Number.isFinite(floorSqm) ? floorSqm : null,
          Number.isFinite(racks) ? racks : null,
          Number.isFinite(yearEstablished as number) ? yearEstablished : null,
          metadata.tier != null ? String(metadata.tier) : null,
        ]
      )
      dcId = ins.rows[0].id
    }

    const rawSources = Array.isArray(payload.sources) ? payload.sources : []
    for (const s of rawSources) {
      const src = s as Record<string, unknown>
      const url = String(src.url || '').trim()
      const srcName = String(src.name || 'Source').trim()
      if (!url) continue
      const scrapedAt = src.scraped_at
        ? new Date(String(src.scraped_at)).toISOString()
        : new Date().toISOString()

      await query(
        `
        INSERT INTO sources (data_center_id, url, name, scraped_at, verified)
        SELECT $1, $2, $3, $4::timestamptz, true
        WHERE NOT EXISTS (
          SELECT 1 FROM sources WHERE data_center_id = $1 AND url = $2
        )
      `,
        [dcId, url, srcName, scrapedAt]
      )
    }

    const dc = await this.findById(dcId, { includeUnpublished: true })
    if (!dc) throw new Error('Failed to load data center after upsert')
    return dc
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
      verified: row.verified !== false,
    }
  }
}

