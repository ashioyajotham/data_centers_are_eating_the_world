import { Request, Response } from 'express'
import { query } from '../db/connection'

/** Published-only stats unless admin JWT is present (matches public map). */
export const getStatistics = async (req: Request, res: Response) => {
  try {
    const admin = Boolean(req.adminAuth)

    const totalSql = admin
      ? 'SELECT COUNT(*) as count FROM data_centers'
      : 'SELECT COUNT(*) as count FROM data_centers WHERE verified IS NOT FALSE'

    const total = parseInt((await query(totalSql)).rows[0].count)

    const statusSql = admin
      ? `SELECT status, COUNT(*) as count FROM data_centers GROUP BY status`
      : `SELECT status, COUNT(*) as count FROM data_centers WHERE verified IS NOT FALSE GROUP BY status`

    const statusResult = await query(statusSql)
    const byStatus: Record<string, number> = {}
    statusResult.rows.forEach((row: { status: string; count: string }) => {
      byStatus[row.status] = parseInt(row.count)
    })

    const ownershipSql = admin
      ? `SELECT ownership_type, COUNT(*) as count FROM data_centers GROUP BY ownership_type`
      : `SELECT ownership_type, COUNT(*) as count FROM data_centers WHERE verified IS NOT FALSE GROUP BY ownership_type`

    const ownershipResult = await query(ownershipSql)
    const byOwnership: Record<string, number> = {}
    ownershipResult.rows.forEach((row: { ownership_type: string; count: string }) => {
      byOwnership[row.ownership_type] = parseInt(row.count)
    })

    const countrySql = admin
      ? `SELECT country, COUNT(*) as count FROM data_centers GROUP BY country ORDER BY count DESC`
      : `SELECT country, COUNT(*) as count FROM data_centers WHERE verified IS NOT FALSE GROUP BY country ORDER BY count DESC`

    const countryResult = await query(countrySql)
    const byCountry: Record<string, number> = {}
    countryResult.rows.forEach((row: { country: string; count: string }) => {
      byCountry[row.country] = parseInt(row.count)
    })

    const capacitySql = admin
      ? `
      SELECT 
        SUM(power_capacity_mw) as total,
        AVG(power_capacity_mw) as average
      FROM data_centers
      WHERE power_capacity_mw IS NOT NULL
    `
      : `
      SELECT 
        SUM(power_capacity_mw) as total,
        AVG(power_capacity_mw) as average
      FROM data_centers
      WHERE power_capacity_mw IS NOT NULL AND verified IS NOT FALSE
    `

    const capacityResult = await query(capacitySql)
    const totalCapacityMW = parseFloat(capacityResult.rows[0].total || 0)
    const averageCapacity = parseFloat(capacityResult.rows[0].average || 0)

    const growthSql = admin
      ? `
      SELECT 
        year_established as year,
        COUNT(*) as count
      FROM data_centers
      WHERE year_established IS NOT NULL
      GROUP BY year_established
      ORDER BY year_established
    `
      : `
      SELECT 
        year_established as year,
        COUNT(*) as count
      FROM data_centers
      WHERE year_established IS NOT NULL AND verified IS NOT FALSE
      GROUP BY year_established
      ORDER BY year_established
    `

    const growthResult = await query(growthSql)
    const growthByYear = growthResult.rows.map((row: { year: number; count: string }) => ({
      year: parseInt(String(row.year)),
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
