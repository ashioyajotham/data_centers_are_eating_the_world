import { query } from './connection'
import { dataCenterSources } from './sources-data'

async function updateSources() {
  try {
    console.log('🔄 Updating data center sources with real URLs...')

    for (const [dcName, sources] of Object.entries(dataCenterSources)) {
      // Find the data center
      const dcResult = await query(
        'SELECT id FROM data_centers WHERE name = $1',
        [dcName]
      )

      if (dcResult.rows.length === 0) {
        console.log(`⏭️  Skipping ${dcName} (not found in database)`)
        continue
      }

      const dcId = dcResult.rows[0].id

      // Delete old placeholder sources
      await query(
        'DELETE FROM sources WHERE data_center_id = $1',
        [dcId]
      )

      // Insert real sources
      for (const source of sources) {
        await query(
          `INSERT INTO sources (data_center_id, url, name, scraped_at, verified)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP, true)`,
          [dcId, source.url, source.name]
        )
      }

      console.log(`✅ Updated sources for ${dcName} (${sources.length} source${sources.length > 1 ? 's' : ''})`)
    }

    console.log('🎉 All sources updated successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  }
}

updateSources()

