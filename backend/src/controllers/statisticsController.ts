import { Request, Response } from 'express'
import { query } from '../db/connection'

export const getStatistics = async (req: Request, res: Response) => {
  try {
    // Get total count
    const totalResult = await query('SELECT COUNT(*) as count FROM data_centers')
    const total = parseInt(totalResult.rows[0].count)

    // Get by status
    const statusResult = await query(`
      SELECT status, COUNT(*) as count
      FROM data_centers
      GROUP BY status
    `)
    const byStatus: Record<string, number> = {}
    statusResult.rows.forEach(row => {
      byStatus[row.status] = parseInt(row.count)
    })

    // Get by ownership
    const ownershipResult = await query(`
      SELECT ownership_type, COUNT(*) as count
      FROM data_centers
      GROUP BY ownership_type
    `)
    const byOwnership: Record<string, number> = {}
    ownershipResult.rows.forEach(row => {
      byOwnership[row.ownership_type] = parseInt(row.count)
    })

    // Get by country
    const countryResult = await query(`
      SELECT country, COUNT(*) as count
      FROM data_centers
      GROUP BY country
      ORDER BY count DESC
    `)
    const byCountry: Record<string, number> = {}
    countryResult.rows.forEach(row => {
      byCountry[row.country] = parseInt(row.count)
    })

    // Get capacity stats
    const capacityResult = await query(`
      SELECT 
        SUM(power_capacity_mw) as total,
        AVG(power_capacity_mw) as average
      FROM data_centers
      WHERE power_capacity_mw IS NOT NULL
    `)
    const totalCapacityMW = parseFloat(capacityResult.rows[0].total || 0)
    const averageCapacity = parseFloat(capacityResult.rows[0].average || 0)

    // Get growth by year
    const growthResult = await query(`
      SELECT 
        year_established as year,
        COUNT(*) as count
      FROM data_centers
      WHERE year_established IS NOT NULL
      GROUP BY year_established
      ORDER BY year_established
    `)
    const growthByYear = growthResult.rows.map(row => ({
      year: parseInt(row.year),
      count: parseInt(row.count),
    }))

    res.json({
      totalDataCenters: total,
      byStatus,
      byOwnership,
      byCountry,
      totalCapacityMW,
      averageCapacity,
      growthByYear,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}

