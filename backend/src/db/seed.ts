import { query } from './connection'
import { getSourcesForDataCenter } from './sources-data'

// Minimal seed data - just enough to demonstrate the app works
// For production data, use the scraper: python scraper/main.py
const initialDataCenters = [
  {
    name: 'Africa Data Centres Nairobi',
    operator: 'Africa Data Centres (Cassava Technologies)',
    address: 'Sameer Business Park, Mombasa Road, Nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    latitude: -1.3144,
    longitude: 36.8822,
    status: 'operational',
    ownership_type: 'foreign',
    power_capacity_mw: 10,
    year_established: 2017,
  },
  {
    name: 'iXAfrica Nairobi Data Center',
    operator: 'iXAfrica',
    address: 'Mombasa Road, Nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    latitude: -1.3205,
    longitude: 36.8831,
    status: 'operational',
    ownership_type: 'local',
    power_capacity_mw: 5,
    year_established: 2013,
  },
  {
    name: 'Safaricom M-PESA Data Center',
    operator: 'Safaricom',
    address: 'Nairobi',
    city: 'Nairobi',
    country: 'Kenya',
    latitude: -1.2864,
    longitude: 36.8172,
    status: 'operational',
    ownership_type: 'local',
    power_capacity_mw: 3,
    year_established: 2015,
  },
]

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with initial data centers...')

    for (const dc of initialDataCenters) {
      // Check if already exists
      const existing = await query(
        'SELECT id FROM data_centers WHERE name = $1',
        [dc.name]
      )

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping ${dc.name} (already exists)`)
        continue
      }

      // Insert data center
      const result = await query(
        `
        INSERT INTO data_centers (
          name, operator, address, city, country,
          latitude, longitude,
          status, ownership_type,
          power_capacity_mw, year_established
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7,
          $8, $9,
          $10, $11
        )
        RETURNING id
      `,
        [
          dc.name,
          dc.operator,
          dc.address,
          dc.city,
          dc.country,
          dc.latitude,
          dc.longitude,
          dc.status,
          dc.ownership_type,
          dc.power_capacity_mw,
          dc.year_established,
        ]
      )

      const dcId = result.rows[0].id

      // Add real source(s) for this data center
      const sources = getSourcesForDataCenter(dc.name)
      for (const source of sources) {
        await query(
          `
          INSERT INTO sources (data_center_id, url, name, scraped_at, verified)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP, true)
        `,
          [dcId, source.url, source.name]
        )
      }

      console.log(`✅ Added ${dc.name}`)
    }

    console.log('🎉 Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()

